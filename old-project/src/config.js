// Get Gemini API key from environment variables
export const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Default model settings
export const DEFAULT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 1024,
  topK: 40,
  topP: 0.95,
};
