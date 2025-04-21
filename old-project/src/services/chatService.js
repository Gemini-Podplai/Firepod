import { GoogleGenerativeAI } from '@google/generative-ai';

// Create a chat service that handles communication with the Gemini API
class ChatService {
  constructor() {
    // Initialize the API client
    this.genAI = null;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    this.initializeClient();
    
    // Store active models and their configurations
    this.models = {
      'Gemini 2.5 Pro': 'gemini-2.5-pro',
      'Gemini 2.0 Flash': 'gemini-2.0-flash',
      'Gemini 1.5 Pro': 'gemini-1.5-pro',
      'Gemini 1.5 Flash': 'gemini-1.5-flash'
    };
    
    this.defaultModel = 'Gemini 2.5 Pro';
    this.activeModel = this.models[this.defaultModel];
  }
  
  initializeClient() {
    if (!this.apiKey) {
      console.error("Google API key is not set. Please check your environment variables.");
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } catch (error) {
      console.error("Failed to initialize Google Generative AI client:", error);
    }
  }
  
  setModel(modelName) {
    if (this.models[modelName]) {
      this.activeModel = this.models[modelName];
      return true;
    }
    return false;
  }
  
  async sendMessage(messages, options = {}) {
    if (!this.genAI) {
      throw new Error("API client not initialized. Please check your API key.");
    }
    
    // Convert our message format to Gemini's format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    const lastMessage = messages[messages.length - 1];
    
    try {
      // Get the model and create a chat session
      const model = this.genAI.getGenerativeModel({
        model: this.activeModel
      });
      
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40
        }
      });
      
      // Send the message and return a promise
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      return {
        role: 'assistant',
        content: response.text()
      };
      
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }
  
  // Stream response for real-time updates
  async streamMessage(messages, onUpdateResponse, options = {}) {
    if (!this.genAI) {
      throw new Error("API client not initialized. Please check your API key.");
    }
    
    // Convert our message format to Gemini's format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    const lastMessage = messages[messages.length - 1];
    
    try {
      // Get the model and create a chat session
      const model = this.genAI.getGenerativeModel({
        model: this.activeModel
      });
      
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40
        }
      });
      
      // Get the streaming response
      const result = await chat.sendMessageStream(lastMessage.content);
      
      let fullResponse = '';
      
      // Process the stream
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        // Pass the accumulated text to the callback
        if (onUpdateResponse) {
          onUpdateResponse(fullResponse);
        }
      }
      
      // Return the complete response
      return {
        role: 'assistant',
        content: fullResponse
      };
      
    } catch (error) {
      console.error("Error streaming message from Gemini:", error);
      // Retry logic could be implemented here
      throw error;
    }
  }
  
  // Helper to retry failed API calls
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff
        delay *= 2;
      }
    }
  }
}

// Create a singleton instance
const chatService = new ChatService();
export default chatService;
