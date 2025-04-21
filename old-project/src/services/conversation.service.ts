import { DatabaseService } from './database.service';

export interface Message {
  id?: number;
  role: string;
  content: string;
  timestamp?: Date;
}

export interface Conversation {
  id?: number;
  title: string;
  messages: Message[];
  created_at?: Date;
  updated_at?: Date;
}

export class ConversationService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async createConversation(title: string): Promise<number> {
    const result = await this.db.query(
      'INSERT INTO conversations (title) VALUES ($1) RETURNING id',
      [title]
    );
    return result.rows[0].id;
  }

  async saveMessage(conversationId: number, message: Message): Promise<number> {
    const result = await this.db.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id',
      [conversationId, message.role, message.content]
    );
    
    // Update the conversation's updated_at timestamp
    await this.db.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );
    
    return result.rows[0].id;
  }

  async getConversations(): Promise<Conversation[]> {
    const result = await this.db.query(
      'SELECT * FROM conversations ORDER BY updated_at DESC'
    );
    return result.rows;
  }

  async getConversation(id: number): Promise<Conversation> {
    // Get conversation details
    const conversationResult = await this.db.query(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    
    if (conversationResult.rows.length === 0) {
      throw new Error(`Conversation with ID ${id} not found`);
    }
    
    const conversation = conversationResult.rows[0];
    
    // Get all messages for this conversation
    const messagesResult = await this.db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC',
      [id]
    );
    
    return {
      ...conversation,
      messages: messagesResult.rows
    };
  }

  async updateConversationTitle(id: number, title: string): Promise<void> {
    await this.db.query(
      'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [title, id]
    );
  }

  async deleteConversation(id: number): Promise<void> {
    await this.db.query('DELETE FROM conversations WHERE id = $1', [id]);
  }
}
