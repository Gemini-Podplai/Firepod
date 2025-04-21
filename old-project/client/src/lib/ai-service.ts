import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ModelSettings } from "@/components/gemini/model-settings";

// Initialize the Google AI client with API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || "");

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export class AIService {
  // Store the model settings
  private modelSettings: ModelSettings;
  
  // Store the chat history
  private chatHistory: any[] = [];
  
  // Store the chat model
  private model: any;

  constructor(initialSettings: ModelSettings) {
    this.modelSettings = initialSettings;
    this.initializeModel();
  }

  // Initialize or reinitialize the model with current settings
  private initializeModel() {
    const { model } = this.modelSettings;
    
    try {
      this.model = genAI.getGenerativeModel({
        model,
        safetySettings,
      });
      
      console.log(`Initialized AI model: ${model}`);
    } catch (error) {
      console.error("Error initializing model:", error);
      throw new Error(`Failed to initialize AI model: ${error.message}`);
    }
  }

  // Update the model settings
  public updateSettings(newSettings: ModelSettings) {
    const modelChanged = this.modelSettings.model !== newSettings.model;
    this.modelSettings = newSettings;
    
    // If the model changed, reinitialize
    if (modelChanged) {
      this.initializeModel();
    }
    
    return this.modelSettings;
  }
  
  // Get the current model settings
  public getSettings(): ModelSettings {
    return { ...this.modelSettings };
  }

  // Start a new chat session
  public startChat() {
    try {
      // Set up chat with history capability
      const chatSession = this.model.startChat({
        generationConfig: {
          temperature: this.modelSettings.temperature,
          topP: this.modelSettings.topP,
          topK: this.modelSettings.topK,
          maxOutputTokens: this.modelSettings.maxOutputTokens,
        },
        systemPrompt: this.modelSettings.systemPrompt,
      });
      
      this.chatHistory = [];
      return chatSession;
    } catch (error) {
      console.error("Error starting chat:", error);
      throw new Error(`Failed to start chat: ${error.message}`);
    }
  }

  // Generate content with text prompt
  public async generateContent(prompt: string, options = {}) {
    try {
      const generationConfig = {
        temperature: this.modelSettings.temperature,
        topP: this.modelSettings.topP,
        topK: this.modelSettings.topK,
        maxOutputTokens: this.modelSettings.maxOutputTokens,
      };

      // If web search is enabled, add parameters for it
      const modelParams: any = { safetySettings };
      
      if (this.modelSettings.enableWebSearch) {
        modelParams.tools = [{
          web_search: {}
        }];
      }
      
      // Create generative model with these parameters
      const enhancedModel = genAI.getGenerativeModel({
        model: this.modelSettings.model,
        ...modelParams
      });
      
      const result = await enhancedModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        ...options
      });

      return result.response;
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  // Send a message to the chat and get a response (with streaming support)
  public async sendMessage(
    chatSession: any,
    message: string,
    callbacks?: {
      onStart?: () => void;
      onToken?: (token: string) => void;
      onComplete?: (response: any) => void;
    }
  ) {
    try {
      callbacks?.onStart?.();
      
      const messageOptions: any = {};
      
      // Add tools if enabled
      if (this.modelSettings.enableWebSearch || 
          this.modelSettings.enableCodeExecution ||
          this.modelSettings.enableToolUse) {
        
        messageOptions.tools = [];
        
        if (this.modelSettings.enableWebSearch) {
          messageOptions.tools.push({ web_search: {} });
        }
        
        if (this.modelSettings.enableCodeExecution) {
          messageOptions.tools.push({ code_execution: {} });
        }
        
        if (this.modelSettings.enableCodeInterpreter) {
          messageOptions.tools.push({ code_interpreter: {} });
        }
      }
      
      // If callbacks for streaming are provided, use streaming
      if (callbacks?.onToken) {
        const result = await chatSession.sendMessageStream(message, messageOptions);
        
        let fullResponse = "";
        for await (const chunk of result.stream) {
          const content = chunk.text();
          callbacks.onToken(content);
          fullResponse += content;
        }
        
        // Add to chat history
        this.chatHistory.push({
          role: "user",
          content: message
        });
        
        this.chatHistory.push({
          role: "assistant",
          content: fullResponse
        });
        
        callbacks?.onComplete?.(result.response);
        return result.response;
      } 
      // Otherwise use regular request
      else {
        const result = await chatSession.sendMessage(message, messageOptions);
        
        // Add to chat history
        this.chatHistory.push({
          role: "user",
          content: message
        });
        
        this.chatHistory.push({
          role: "assistant",
          content: result.text()
        });
        
        callbacks?.onComplete?.(result);
        return result;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Process media (images, audio) with multimodal models
  public async processMedia(mediaData: any, prompt: string) {
    try {
      // Ensure we're using a multimodal model
      if (!this.modelSettings.model.includes("vision")) {
        throw new Error("Current model does not support multimodal inputs. Please switch to a vision-enabled model.");
      }
      
      const generationConfig = {
        temperature: this.modelSettings.temperature,
        topP: this.modelSettings.topP,
        topK: this.modelSettings.topK,
        maxOutputTokens: this.modelSettings.maxOutputTokens,
      };
      
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mediaData.mimeType, data: mediaData.data } }
            ]
          }
        ],
        generationConfig,
      });
      
      return result.response;
    } catch (error) {
      console.error("Error processing media:", error);
      throw new Error(`Failed to process media: ${error.message}`);
    }
  }
  
  // Get the chat history
  public getChatHistory() {
    return [...this.chatHistory];
  }

  // Clear the chat history
  public clearChatHistory() {
    this.chatHistory = [];
  }
}

// Default model settings
export const defaultModelSettings: ModelSettings = {
  model: "gemini-1.5-pro",
  temperature: 0.7,
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 40,
  enableWebSearch: false,
  enableCodeExecution: false,
  enableCodeInterpreter: false,
  enableToolUse: false,
  systemPrompt: "You are a helpful AI assistant. Respond to user queries accurately, concisely, and helpfully.",
  chatPersona: "balanced",
};

// Create a singleton instance
export const aiService = new AIService(defaultModelSettings);