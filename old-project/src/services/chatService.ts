import { v4 as uuidv4 } from 'uuid';
import { dbService, Chat, ChatMessage } from './dbService';
import { ModelParameters, DEFAULT_PARAMETERS } from '../types/model';

export interface ChatState {
  id: string;
  title: string;
  modelId: string;
  messages: ChatMessage[];
  parameters: ModelParameters;
}

export class ChatService {
  // Create a new chat
  static createNewChat(modelId: string, initialSystemPrompt?: string): ChatState {
    const now = new Date();
    const chatId = uuidv4();
    
    const messages: ChatMessage[] = [];
    
    // Add system prompt if provided
    if (initialSystemPrompt) {
      messages.push({
        id: uuidv4(),
        role: 'system',
        content: initialSystemPrompt,
        timestamp: now
      });
    }
    
    return {
      id: chatId,
      title: `New Chat ${now.toLocaleDateString()}`,
      modelId,
      messages,
      parameters: { ...DEFAULT_PARAMETERS }
    };
  }
  
  // Save current chat to PostgreSQL
  static async saveChat(chat: ChatState): Promise<string> {
    const now = new Date();
    
    const chatToSave: Chat = {
      id: chat.id,
      title: chat.title,
      modelId: chat.modelId,
      createdAt: chat.messages.length > 0 
        ? chat.messages[0].timestamp 
        : now,
      updatedAt: now,
      messages: chat.messages
    };
    
    return dbService.saveChat(chatToSave);
  }
  
  // Add a message to the chat
  static addMessage(
    chat: ChatState, 
    role: 'user' | 'assistant' | 'system', 
    content: string
  ): ChatState {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    
    // Generate a title from the first user message if this is a new chat
    let title = chat.title;
    if (
      role === 'user' && 
      chat.messages.filter(m => m.role === 'user').length === 0 &&
      chat.title.startsWith('New Chat')
    ) {
      // Extract first ~30 chars of content for title
      title = content.length > 30 
        ? content.substring(0, 30) + '...'
        : content;
    }
    
    return {
      ...chat,
      title,
      messages: [...chat.messages, newMessage]
    };
  }
  
  // Load a chat from the database
  static async loadChat(chatId: string): Promise<ChatState | null> {
    const chat = await dbService.getChat(chatId);
    
    if (!chat) {
      return null;
    }
    
    return {
      id: chat.id,
      title: chat.title,
      modelId: chat.modelId,
      messages: chat.messages,
      parameters: { ...DEFAULT_PARAMETERS } // Default parameters when loading
    };
  }
  
  // Load all chats (summary only)
  static async loadAllChats(): Promise<Omit<Chat, 'messages'>[]> {
    return dbService.getChats();
  }
}
