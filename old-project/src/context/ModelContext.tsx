import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Model, AVAILABLE_MODELS, DEFAULT_MODEL_ID, getModelById } from '../types/model';

interface ModelContextType {
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
  availableModels: Model[];
}

const ModelContext = createContext<ModelContextType>({
  selectedModel: AVAILABLE_MODELS[0],
  setSelectedModel: () => {},
  availableModels: AVAILABLE_MODELS,
});

export const useModel = () => useContext(ModelContext);

interface ModelProviderProps {
  children: ReactNode;
}

export const ModelProvider = ({ children }: ModelProviderProps) => {
  const [selectedModel, setSelectedModel] = useState<Model>(() => {
    // Try to load from localStorage when component initializes
    const savedModelId = localStorage.getItem('selectedModelId');
    if (savedModelId) {
      const model = getModelById(savedModelId);
      return model || AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AVAILABLE_MODELS[0];
    }
    return AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL_ID) || AVAILABLE_MODELS[0];
  });

  // Save to localStorage whenever selectedModel changes
  useEffect(() => {
    localStorage.setItem('selectedModelId', selectedModel.id);
  }, [selectedModel]);

  const value = {
    selectedModel,
    setSelectedModel,
    availableModels: AVAILABLE_MODELS,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};
