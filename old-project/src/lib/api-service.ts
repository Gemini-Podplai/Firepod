/**
 * API Service
 * 
 * This file handles API calls, ensuring that sensitive API keys
 * are only used server-side and not exposed to the client.
 */

type ChatMessage = {
  role: string;
  content: string;
};

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  error?: string;
}

// Chat completion API - use server-side endpoint instead of direct API calls
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    return {
      message: { role: 'assistant', content: 'Sorry, an error occurred while processing your request.' },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Google API service - use server-side endpoint
export async function callGoogleAPI(endpoint: string, params: any): Promise<any> {
  try {
    const response = await fetch(`/api/google/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Google API:', error);
    throw error;
  }
}

// Firebase helper functions
// These can use client-side Firebase config as they're public keys
export const getFirebaseConfig = () => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
};
