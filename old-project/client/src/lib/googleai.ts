import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ChatMessage } from "./openai";
import { withRetry, DEFAULT_RETRY_OPTIONS } from "./retry";

// Constants for Gemini model access
export const AI_MODELS = {
  GOOGLE: [
    // Gemini 2.5 Models
    {
      id: "gemini-2.5-pro-exp-03-25",
      name: "Gemini 2.5 Pro (Experimental)",
      provider: "Google",
      icon: "google",
      description: "Offers advanced reasoning, especially for multimodal understanding, coding, and world knowledge",
      contextWindow: "2,097,152 tokens",
      bestFor: "Complex reasoning, multimodal tasks, and world knowledge"
    },
    // Gemini 2.0 Models
    {
      id: "gemini-2.0-flash-001",
      name: "Gemini 2.0 Flash",
      provider: "Google",
      icon: "google",
      description: "Provides next generation features and speed for a diverse variety of tasks",
      contextWindow: "1,048,576 tokens",
      bestFor: "Chat, text processing, code generation, multimodal tasks"
    },
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash (Latest)",
      provider: "Google",
      icon: "google",
      description: "Auto-updated to the latest stable version of Gemini 2.0 Flash",
      contextWindow: "1,048,576 tokens",
      bestFor: "Production applications requiring the latest stable model"
    },
    {
      id: "gemini-2.0-flash-lite-001",
      name: "Gemini 2.0 Flash-Lite",
      provider: "Google",
      icon: "google",
      description: "Provides cost effective and low latency performance; supports high throughput",
      contextWindow: "1,048,576 tokens",
      bestFor: "High throughput applications, lower latency requirements"
    },
    {
      id: "gemini-2.0-flash-lite",
      name: "Gemini 2.0 Flash-Lite (Latest)",
      provider: "Google",
      icon: "google",
      description: "Auto-updated to the latest stable version of Gemini 2.0 Flash-Lite",
      contextWindow: "1,048,576 tokens",
      bestFor: "Production applications requiring the latest stable model"
    },
    {
      id: "gemini-2.0-flash-thinking-exp-01-21",
      name: "Gemini 2.0 Flash-Thinking",
      provider: "Google",
      icon: "google",
      description: "Offers stronger reasoning capabilities and includes the thinking process in responses",
      contextWindow: "1,048,576 tokens",
      bestFor: "Reasoning tasks, explaining thought process, educational use cases"
    },
  ],
};

// SafetySettings for Gemini models
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

// Mapping ChatMessage roles to Gemini roles
function mapRoles(message: ChatMessage) {
  switch (message.role) {
    case "assistant":
      return "model";
    case "system":
      return "user"; // Gemini doesn't have a system role, we'll prepend it as a user message
    default:
      return message.role;
  }
}

/**
 * Initialize the Google AI client with the provided API key
 */
export function initGoogleAI(apiKey: string) {
  if (!apiKey || apiKey.trim() === "") {
    console.error("Google API key is missing or empty. Check environment variables.");
    throw new Error("Invalid Google API key. Please check your application configuration.");
  }
  
  console.log("Initializing Google AI with API key (first few characters):", apiKey.substring(0, 5) + "...");
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Send a chat message to the Gemini model (non-streaming version)
 */
export async function sendChatMessageGemini(
  modelId: string,
  messages: ChatMessage[],
  apiKey: string,
  parameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt?: string;
  }
) {
  try {
    const genAI = initGoogleAI(apiKey);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: modelId });
    
    // Format messages for Gemini
    const chatHistory = [];
    
    // Handle system prompt separately since Gemini doesn't have a system role
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    // Add system messages first (as user messages)
    if (systemMessages.length > 0 || parameters.systemPrompt) {
      let systemContent = parameters.systemPrompt || "";
      systemMessages.forEach(msg => {
        systemContent += (systemContent ? "\n\n" : "") + msg.content;
      });
      
      if (systemContent) {
        chatHistory.push({
          role: "user",
          parts: [{ text: `[System Instructions]\n${systemContent}\n[End System Instructions]` }],
        });
        
        // Add a model response to complete the turn
        chatHistory.push({
          role: "model",
          parts: [{ text: "I'll follow these instructions carefully." }],
        });
      }
    }
    
    // Add non-system messages
    nonSystemMessages.forEach(message => {
      chatHistory.push({
        role: mapRoles(message),
        parts: [{ text: message.content }],
      });
    });
    
    // Start the chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: parameters.temperature,
        topP: parameters.topP, 
        maxOutputTokens: parameters.maxTokens,
      },
      safetySettings,
    });
    
    // Send the message and get response
    const result = await chat.sendMessage("");
    
    const response = result.response;
    
    return {
      id: new Date().getTime().toString(),
      role: "assistant" as const,
      content: response.text(),
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred with Google AI';
      
    console.error("Error with Google AI:", error);
    return {
      id: new Date().getTime().toString(),
      role: "assistant" as const,
      content: `Error communicating with Google AI: ${errorMessage}`,
      timestamp: new Date().getTime(),
    };
  }
}

/**
 * Send a chat message to the Gemini model with streaming response
 */
export async function sendChatMessageGeminiStream(
  modelId: string,
  messages: ChatMessage[],
  apiKey: string,
  parameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt?: string;
  },
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: (fullResponse: string) => void
) {
  try {
    console.log(`Starting Gemini stream with model: ${modelId}`);
    
    const genAI = initGoogleAI(apiKey);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: modelId });
    
    // Format messages for Gemini
    const chatHistory = [];
    
    // Handle system prompt separately since Gemini doesn't have a system role
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    console.log(`Processing ${systemMessages.length} system messages and ${nonSystemMessages.length} regular messages`);
    
    // Add system messages first (as user messages)
    if (systemMessages.length > 0 || parameters.systemPrompt) {
      let systemContent = parameters.systemPrompt || "";
      systemMessages.forEach(msg => {
        systemContent += (systemContent ? "\n\n" : "") + msg.content;
      });
      
      if (systemContent) {
        chatHistory.push({
          role: "user",
          parts: [{ text: `[System Instructions]\n${systemContent}\n[End System Instructions]` }],
        });
        
        // Add a model response to complete the turn
        chatHistory.push({
          role: "model",
          parts: [{ text: "I'll follow these instructions carefully." }],
        });
      }
    }
    
    // Add non-system messages
    nonSystemMessages.forEach(message => {
      chatHistory.push({
        role: mapRoles(message),
        parts: [{ text: message.content }],
      });
    });
    
    console.log(`Generation config: Temperature=${parameters.temperature}, TopP=${parameters.topP}, MaxTokens=${parameters.maxTokens}`);
    
    // Start the chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: parameters.temperature,
        topP: parameters.topP, 
        maxOutputTokens: parameters.maxTokens,
      },
      safetySettings,
    });
    
    console.log("Chat started, sending message stream...");
    
    // Send the message and get a streaming response
    const result = await chat.sendMessageStream("");
    let fullResponse = "";
    
    console.log("Stream response received, processing chunks...");
    
    // Process the stream
    for await (const chunk of result.stream) {
      const textChunk = chunk.text();
      fullResponse += textChunk;
      onChunk(textChunk);
    }
    
    console.log("Streaming complete, total response length:", fullResponse.length);
    
    // Call the complete callback with the full response
    onComplete(fullResponse);
    
    return {
      id: new Date().getTime().toString(),
      role: "assistant" as const,
      content: fullResponse,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred with Google AI';
      
    console.error("Error with Google AI streaming:", error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
      
      // Check for common API errors
      if (errorMessage.includes("UNAUTHENTICATED") || errorMessage.includes("API key")) {
        console.error("Authentication error: Check your Google API key");
        onError(new Error("Authentication failed. Please verify your Google API key."));
      } else if (errorMessage.includes("PERMISSION_DENIED")) {
        console.error("Permission denied: Your API key may not have access to this model");
        onError(new Error("Permission denied. Your API key may not have access to this model."));
      } else if (errorMessage.includes("RESOURCE_EXHAUSTED")) {
        console.error("Resource exhausted: You may have reached your quota limit");
        onError(new Error("Resource exhausted. You may have reached your quota limit."));
      } else {
        onError(new Error(errorMessage));
      }
    } else {
      onError(new Error("Unknown error occurred with Google AI"));
    }
    
    return {
      id: new Date().getTime().toString(),
      role: "assistant" as const,
      content: `Error communicating with Google AI: ${errorMessage}`,
      timestamp: new Date().getTime(),
    };
  }
}

/**
 * Generate code with a Gemini model
 */
export async function generateCodeGemini(
  modelId: string, 
  prompt: string,
  language: string,
  apiKey: string,
  parameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt?: string;
  }
) {
  try {
    const genAI = initGoogleAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    
    // Create an appropriate prompt for code generation
    const codePrompt = `
${parameters.systemPrompt ? parameters.systemPrompt + "\n\n" : ""}
Generate code in ${language} for the following requirement:

${prompt}

Please provide only the code without explanations, comments are acceptable.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: codePrompt }] }],
      generationConfig: {
        temperature: parameters.temperature,
        topP: parameters.topP,
        maxOutputTokens: parameters.maxTokens,
      },
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract code from response if it's wrapped in markdown code blocks
    const codeRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
    const match = text.match(codeRegex);
    
    return match ? match[1].trim() : text;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred with Google AI';
      
    console.error("Error generating code with Google AI:", error);
    return `// Error generating code: ${errorMessage}`;
  }
}