import type { NextApiRequest, NextApiResponse } from 'next';

type ChatMessage = {
  role: string;
  content: string;
};

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

interface ChatResponse {
  message: ChatMessage;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: { role: 'system', content: 'Method not allowed' },
      error: 'Method not allowed'
    });
  }

  try {
    const { messages, model = 'gpt-4' } = req.body as ChatRequest;

    // Call OpenAI API using server-side API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    return res.status(200).json({
      message: assistantMessage
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({
      message: { role: 'system', content: 'Error processing your request' },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
