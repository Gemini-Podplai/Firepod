export type OutputType = 'text' | 'image' | 'error';

export interface ExecutionResult {
  type: OutputType;
  content: string;
  mimeType?: string; // for images
  timestamp?: number;
  executionId?: string;
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  modelName: string;
}

export interface ConversationContext {
  messages: Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
    executionResults?: ExecutionResult[];
  }>;
}

export interface ExecutionHistoryItem {
  id: string;
  code: string;
  language: string;
  results: ExecutionResult[];
  timestamp: number;
}

export interface SharedState {
  modelParameters: ModelParameters;
  conversationContext: ConversationContext;
  executionHistory: ExecutionHistoryItem[];
  currentCode: {
    content: string;
    language: string;
  };
}

// Event types for state changes
export type StateChangeEventType = 
  'model-changed' | 
  'parameters-changed' | 
  'conversation-updated' |
  'execution-added' |
  'code-changed';

// Define event listener type
export type StateChangeListener = (
  eventType: StateChangeEventType, 
  newState: Partial<SharedState>
) => void;

export class CodeExecutionService {
  private static listeners: StateChangeListener[] = [];
  private static state: SharedState = {
    modelParameters: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      modelName: 'gpt-4'
    },
    conversationContext: {
      messages: []
    },
    executionHistory: [],
    currentCode: {
      content: '',
      language: 'javascript'
    }
  };

  // Get current state (return a copy to prevent direct mutations)
  static getState(): SharedState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Subscribe to state changes
  static subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Update state and notify listeners
  private static updateState(
    eventType: StateChangeEventType,
    partialState: Partial<SharedState>
  ) {
    this.state = { ...this.state, ...partialState };
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(eventType, partialState));
  }

  // Update model parameters
  static updateModelParameters(parameters: Partial<ModelParameters>) {
    const updatedParameters = {
      ...this.state.modelParameters,
      ...parameters
    };
    
    this.updateState('parameters-changed', { 
      modelParameters: updatedParameters 
    });
    
    return updatedParameters;
  }

  // Update conversation context
  static updateConversation(message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
    executionResults?: ExecutionResult[];
  }) {
    const updatedMessages = [
      ...this.state.conversationContext.messages,
      message
    ];
    
    this.updateState('conversation-updated', {
      conversationContext: {
        messages: updatedMessages
      }
    });
    
    return updatedMessages;
  }

  // Update current code
  static updateCurrentCode(content: string, language: string) {
    this.updateState('code-changed', {
      currentCode: { content, language }
    });
    
    return { content, language };
  }

  // Execute JavaScript/TypeScript code in a sandbox
  static executeJavaScript(code: string): Promise<ExecutionResult[]> {
    return new Promise((resolve) => {
      const results: ExecutionResult[] = [];
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      // Capture console.log output
      console.log = (...args: any[]) => {
        originalConsoleLog(...args);
        results.push({
          type: 'text',
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now()
        });
      };
      
      // Enhanced console.error capture with timestamps
      console.error = (...args: any[]) => {
        originalConsoleError(...args);
        results.push({
          type: 'error',
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now()
        });
      };
      
      try {
        // Create a function from the code string and execute it
        const executionFunction = new Function(`
          try {
            ${code}
            return { success: true };
          } catch (error) {
            console.error(error.message);
            return { success: false, error: error.message };
          }
        `);
        
        const result = executionFunction();
        
        // If there was an uncaught error and no results yet, add it
        if (!result.success && results.length === 0) {
          results.push({
            type: 'error',
            content: result.error,
            timestamp: Date.now()
          });
        }

        // Reset console functions
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        
        // If no output was generated, indicate success
        if (results.length === 0) {
          results.push({
            type: 'text',
            content: 'Code executed successfully with no output.',
            timestamp: Date.now()
          });
        }
        
        // Add to execution history
        const executionId = Date.now().toString();
        results.forEach(result => {
          result.executionId = executionId;
        });

        this.addToExecutionHistory({
          id: executionId,
          code,
          language: 'javascript',
          results,
          timestamp: Date.now()
        });
        
        resolve(results);
      } catch (error: any) {
        // Reset console functions
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        
        const errorResult = {
          type: 'error' as OutputType,
          content: error.message || 'Unknown error occurred',
          timestamp: Date.now(),
          executionId: Date.now().toString()
        };
        
        results.push(errorResult);
        
        // Add to execution history even if error
        this.addToExecutionHistory({
          id: errorResult.executionId!,
          code,
          language: 'javascript',
          results,
          timestamp: Date.now()
        });
        
        resolve(results);
      }
    });
  }

  // Add execution to history
  static addToExecutionHistory(execution: ExecutionHistoryItem) {
    const updatedHistory = [...this.state.executionHistory, execution];
    
    // Keep only the most recent 100 executions to avoid memory issues
    if (updatedHistory.length > 100) {
      updatedHistory.shift(); // Remove oldest execution
    }
    
    this.updateState('execution-added', {
      executionHistory: updatedHistory
    });
    
    return updatedHistory;
  }

  // Get execution history
  static getExecutionHistory(): ExecutionHistoryItem[] {
    return [...this.state.executionHistory];
  }

  // Handle Python code (this would require a backend service)
  static executePython(code: string): Promise<ExecutionResult[]> {
    // This is a placeholder. In a real implementation, you would send the code
    // to a backend service that can execute Python and return the results.
    const results = [{
      type: 'text' as OutputType,
      content: 'Python execution requires a backend service. This is a mock response.',
      timestamp: Date.now(),
      executionId: Date.now().toString()
    }];
    
    // Add to execution history
    this.addToExecutionHistory({
      id: results[0].executionId!,
      code,
      language: 'python',
      results,
      timestamp: Date.now()
    });
    
    return Promise.resolve(results);
  }

  // Handle image generation code
  static handleImageOutput(base64Data: string, mimeType: string = 'image/png'): ExecutionResult {
    const result = {
      type: 'image' as OutputType,
      content: base64Data,
      mimeType,
      timestamp: Date.now(),
      executionId: Date.now().toString()
    };
    
    return result;
  }

  // Execute code based on language
  static async executeCode(code: string, language: string): Promise<ExecutionResult[]> {
    // Update current code in state
    this.updateCurrentCode(code, language);
    
    let results: ExecutionResult[];
    
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
        results = await this.executeJavaScript(code);
        break;
      case 'python':
      case 'py':
        results = await this.executionPython(code);
        break;
      default:
        results = [{
          type: 'error',
          content: `Unsupported language: ${language}. Currently supported languages are JavaScript and TypeScript.`,
          timestamp: Date.now(),
          executionId: Date.now().toString()
        }];
        
        // Add to execution history even for unsupported languages
        this.addToExecutionHistory({
          id: results[0].executionId!,
          code,
          language,
          results,
          timestamp: Date.now()
        });
    }
    
    return results;
  }

  // Save current session to localStorage
  static saveSession() {
    try {
      localStorage.setItem('podplai-session', JSON.stringify(this.state));
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  // Load session from localStorage
  static loadSession(): boolean {
    try {
      const savedState = localStorage.getItem('podplai-session');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.updateState('model-changed', parsedState);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load session:', error);
      return false;
    }
  }

  // Clear current session
  static clearSession() {
    this.state = {
      modelParameters: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        modelName: 'gpt-4'
      },
      conversationContext: {
        messages: []
      },
      executionHistory: [],
      currentCode: {
        content: '',
        language: 'javascript'
      }
    };
    
    localStorage.removeItem('podplai-session');
    
    // Notify all listeners about reset
    this.listeners.forEach(listener => 
      listener('model-changed', this.state)
    );
    
    return this.state;
  }

  // Get chat completion with current model parameters
  static async getChatCompletion(messages: Array<{role: string, content: string}>): Promise<string> {
    // This is a placeholder. In a real implementation, you would send the messages
    // to an API with the current model parameters
    console.log('Getting chat completion with parameters:', this.state.modelParameters);
    
    // Mock response for demo purposes
    return Promise.resolve(
      `This is a mock response from the AI model ${this.state.modelParameters.modelName}`
    );
  }

  // Auto-save session periodically (call once to start)
  static initializeAutoSave(intervalMs = 30000) {
    setInterval(() => {
      this.saveSession();
    }, intervalMs);
  }
}

// Initialize auto-save when module is loaded
if (typeof window !== 'undefined') { // Check if running in browser
  // Initialize from saved session if available
  CodeExecutionService.loadSession();
  
  // Start auto-save (every 30 seconds)
  CodeExecutionService.initializeAutoSave();
  
  // Save session on page unload
  window.addEventListener('beforeunload', () => {
    CodeExecutionService.saveSession();
  });
}
