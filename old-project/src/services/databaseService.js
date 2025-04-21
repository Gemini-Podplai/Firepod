import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  // Use connection string from environment variables
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some PostgreSQL providers like Heroku
  }
});

// Initialize tables if they don't exist
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

// Update to use API endpoints instead of direct DB connection

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Database service methods
const databaseService = {
  // Conversation methods
  async createConversation(title, model = 'Gemini 2.5 Pro') {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, model })
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      return await response.json();
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },
  
  async getConversations() {
    try {
      const response = await fetch(`${API_URL}/conversations`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },
  
  async getConversation(id) {
    try {
      const response = await fetch(`${API_URL}/conversations/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch conversation ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      throw error;
    }
  },
  
  async updateConversationTitle(id, title) {
    try {
      const response = await fetch(`${API_URL}/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      
      if (!response.ok) throw new Error(`Failed to update conversation ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error updating conversation ${id}:`, error);
      throw error;
    }
  },
  
  async deleteConversation(id) {
    try {
      const response = await fetch(`${API_URL}/conversations/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`Failed to delete conversation ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
      throw error;
    }
  },
  
  // Message methods
  async addMessage(conversationId, role, content) {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, content })
      });
      
      if (!response.ok) throw new Error(`Failed to add message to conversation ${conversationId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error adding message to conversation ${conversationId}:`, error);
      throw error;
    }
  },
  
  async getMessages(conversationId) {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error(`Failed to fetch messages for conversation ${conversationId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      throw error;
    }
  },
  
  // Generate a title for a conversation based on the first user message
  async generateConversationTitle(conversationId) {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/generate-title`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error(`Failed to generate title for conversation ${conversationId}`);
      const data = await response.json();
      return data.title;
    } catch (error) {
      console.error(`Error generating title for conversation ${conversationId}:`, error);
      throw error;
    }
  }
};

export default databaseService;
