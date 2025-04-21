const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some PostgreSQL providers like Heroku
  }
});

// Initialize database tables
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        model TEXT NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'))
      )
    `);
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};

// Call init function
initDatabase();

// API Routes

// Get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conversations ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a specific conversation
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching conversation ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create a new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { title, model = 'Gemini 2.5 Pro' } = req.body;
    const result = await pool.query(
      'INSERT INTO conversations (title, model) VALUES ($1, $2) RETURNING *',
      [title, model]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Update conversation title
app.put('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const result = await pool.query(
      'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [title, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating conversation ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Delete a conversation
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting conversation ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching messages for conversation ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add a message to a conversation
app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, content } = req.body;
    
    // Add the message
    const messageResult = await pool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [id, role, content]
    );
    
    // Update the conversation's updated_at timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.status(201).json(messageResult.rows[0]);
  } catch (error) {
    console.error(`Error adding message to conversation ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Generate a title for a conversation
app.post('/api/conversations/:id/generate-title', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the first user message
    const result = await pool.query(
      'SELECT content FROM messages WHERE conversation_id = $1 AND role = \'user\' ORDER BY created_at ASC LIMIT 1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ title: "New Conversation" });
    }
    
    // Create a title from the message
    let title = result.rows[0].content;
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Update the conversation title
    await pool.query(
      'UPDATE conversations SET title = $1 WHERE id = $2',
      [title, id]
    );
    
    res.json({ title });
  } catch (error) {
    console.error(`Error generating title for conversation ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to generate title' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
