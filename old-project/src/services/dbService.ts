import { Pool } from 'pg';

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'podplai',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  modelId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export const dbService = {
  // Save a chat conversation to the database
  saveChat: async (chat: Chat): Promise<string> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert or update chat
      const chatQuery = `
        INSERT INTO chats (id, title, model_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET title = $2, model_id = $3, updated_at = $5
        RETURNING id;
      `;
      
      await client.query(chatQuery, [
        chat.id,
        chat.title,
        chat.modelId,
        chat.createdAt,
        chat.updatedAt,
      ]);
      
      // Delete existing messages for this chat (to handle updates)
      await client.query('DELETE FROM messages WHERE chat_id = $1', [chat.id]);
      
      // Insert all messages
      for (const message of chat.messages) {
        const messageQuery = `
          INSERT INTO messages (id, chat_id, role, content, timestamp)
          VALUES ($1, $2, $3, $4, $5);
        `;
        
        await client.query(messageQuery, [
          message.id,
          chat.id,
          message.role,
          message.content,
          message.timestamp,
        ]);
      }
      
      await client.query('COMMIT');
      return chat.id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Get all chats (summary without messages)
  getChats: async (): Promise<Omit<Chat, 'messages'>[]> => {
    const result = await pool.query(`
      SELECT id, title, model_id, created_at, updated_at
      FROM chats
      ORDER BY updated_at DESC;
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      modelId: row.model_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Get a single chat with all messages
  getChat: async (chatId: string): Promise<Chat | null> => {
    const chatResult = await pool.query(`
      SELECT id, title, model_id, created_at, updated_at
      FROM chats
      WHERE id = $1;
    `, [chatId]);
    
    if (chatResult.rows.length === 0) {
      return null;
    }
    
    const chatData = chatResult.rows[0];
    
    const messagesResult = await pool.query(`
      SELECT id, role, content, timestamp
      FROM messages
      WHERE chat_id = $1
      ORDER BY timestamp ASC;
    `, [chatId]);
    
    return {
      id: chatData.id,
      title: chatData.title,
      modelId: chatData.model_id,
      createdAt: chatData.created_at,
      updatedAt: chatData.updated_at,
      messages: messagesResult.rows.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  },

  // Delete a chat
  deleteChat: async (chatId: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);
      const result = await client.query('DELETE FROM chats WHERE id = $1', [chatId]);
      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
