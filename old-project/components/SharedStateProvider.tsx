import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  CodeExecutionService, 
  SharedState, 
  StateChangeEventType,
  ModelParameters,
  ExecutionHistoryItem
} from '../services/CodeExecutionService';

// Create context
type SharedStateContextType = {
  state: SharedState;
  updateModelParameters: (params: Partial<ModelParameters>) => void;
  executeCode: (code: string, language: string) => Promise<any>;
  addChatMessage: (content: string, isUser: boolean) => void;
  clearSession: () => void;
  saveSession: () => boolean;
  currentModelIndicator: JSX.Element;
};

const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

// Provider component
export const SharedStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SharedState>(CodeExecutionService.getState());
  
  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = CodeExecutionService.subscribe((eventType, newState) => {
      // Update our React state when the service state changes
      setState(currentState => ({ ...currentState, ...newState }));
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
  
  // Update model parameters
  const updateModelParameters = (params: Partial<ModelParameters>) => {
    CodeExecutionService.updateModelParameters(params);
  };
  
  // Execute code
  const executeCode = async (code: string, language: string) => {
    return await CodeExecutionService.executeCode(code, language);
  };
  
  // Add a message to chat
  const addChatMessage = (content: string, isUser: boolean) => {
    CodeExecutionService.updateConversation({
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date().toLocaleTimeString()
    });
  };
  
  // Clear session
  const clearSession = () => {
    CodeExecutionService.clearSession();
  };
  
  // Save session
  const saveSession = () => {
    return CodeExecutionService.saveSession();
  };
  
  // Model indicator component
  const currentModelIndicator = useMemo(() => (
    <div className="model-indicator">
      <span className="model-name">{state.modelParameters.modelName}</span>
      <span className="model-temp">T: {state.modelParameters.temperature}</span>
      <style jsx>{`
        .model-indicator {
          display: inline-flex;
          align-items: center;
          background-color: #f3f4f6;
          border-radius: 999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          gap: 8px;
        }
        .model-name {
          font-weight: 600;
          color: #2563eb;
        }
        .model-temp {
          color: #4b5563;
        }
      `}</style>
    </div>
  ), [state.modelParameters]);
  
  const contextValue = {
    state,
    updateModelParameters,
    executeCode,
    addChatMessage,
    clearSession,
    saveSession,
    currentModelIndicator
  };
  
  return (
    <SharedStateContext.Provider value={contextValue}>
      {children}
    </SharedStateContext.Provider>
  );
};

// Custom hook to use the shared state
export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (context === undefined) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};
