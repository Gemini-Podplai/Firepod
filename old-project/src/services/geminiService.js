import { API_KEY } from '../config';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1';

/**
 * Available Gemini models
 */
export const GEMINI_MODELS = {
  GEMINI_PRO: 'models/gemini-pro',
  GEMINI_PRO_VISION: 'models/gemini-pro-vision',
  GEMINI_ULTRA: 'models/gemini-ultra',
  GEMINI_1_5_PRO: 'models/gemini-1.5-pro',
  GEMINI_1_5_FLASH: 'models/gemini-1.5-flash',
};

/**
 * Generate a streaming response from the Gemini API
 * @param {string} prompt - The prompt to send to the API
 * @param {string} model - The model to use (from GEMINI_MODELS)
 * @param {object} options - Additional options for the API
 * @returns {ReadableStream} - A stream of text chunks
 */
export async function generateGeminiStreamingResponse(prompt, model = GEMINI_MODELS.GEMINI_PRO, options = {}) {
  const url = `${GEMINI_BASE_URL}/${model}:streamGenerateContent?key=${API_KEY}`;
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxTokens || 1024,
      stopSequences: options.stopSequences || []
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed with status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser.');
    }

    return response.body;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Process the Gemini API streaming response
 * @param {ReadableStream} stream - The stream from the Gemini API
 * @param {function} onChunk - Callback for each text chunk
 * @returns {Promise<string>} - The complete response
 */
export async function processGeminiStream(stream, onChunk) {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let completeResponse = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode the chunk
      const chunkText = decoder.decode(value, { stream: true });
      
      // Parse the JSON responses in the chunk
      const lines = chunkText.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        try {
          const parsedLine = JSON.parse(line);
          if (parsedLine.candidates && parsedLine.candidates[0]?.content?.parts) {
            const textChunk = parsedLine.candidates[0].content.parts[0].text || '';
            if (textChunk) {
              completeResponse += textChunk;
              onChunk(textChunk);
            }
          }
        } catch (e) {
          console.warn('Could not parse stream chunk:', e);
        }
      }
    }
    
    return completeResponse;
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
