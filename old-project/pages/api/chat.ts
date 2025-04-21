import { NextRequest } from 'next/server';
import { StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from './auth/[...nextauth]';

// Convert messages from the Vercel AI format to Gemini format
function convertVercelMessageToGeminiMessage(message: VercelChatMessage) {
  return {
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }],
  };
}

export const runtime = 'edge';

export default async function POST(req: NextRequest) {
  try {
    // Auth check (edge runtime compatible)
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const {
      messages,
      modelName = 'gemini-1.5-pro',
      temperature = 0.7,
      id: conversationId,
    } = await req.json();

    // Initialize the Google Generative AI API with your API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: modelName });

    // Convert messages from Vercel AI format to Gemini format
    const geminiMessages = messages.map(convertVercelMessageToGeminiMessage);

    // Start a chat session
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
      generationConfig: {
        temperature,
        maxOutputTokens: 8192,
      },
    });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    // Generate a streaming response
    const result = await chat.sendMessageStream(lastMessage.content);

    // Create or get conversation ID
    let actualConversationId = conversationId;
    if (!actualConversationId) {
      actualConversationId = uuidv4();
      
      // Save the new conversation to database
      await sql`
        INSERT INTO conversations (id, user_id, title, model_name, created_at)
        VALUES (
          ${actualConversationId}, 
          ${session.user.id}, 
          ${lastMessage.content.substring(0, 100)}, 
          ${modelName}, 
          NOW()
        )
      `;
    }

    // Save user message to database
    await sql`
      INSERT INTO chat_messages (id, conversation_id, role, content, created_at)
      VALUES (
        ${uuidv4()}, 
        ${actualConversationId}, 
        'user', 
        ${lastMessage.content}, 
        NOW()
      )
    `;

    // Create a readable stream for the AI response
    const stream = result.stream;
    let responseContent = '';
    
    // Create our own transform stream to collect the full response while streaming
    const transformStream = new TransformStream({
      transform: (chunk, controller) => {
        const text = chunk.text();
        responseContent += text;
        controller.enqueue(text);
      },
      flush: async (controller) => {
        // When streaming is complete, save the AI response to the database
        try {
          await sql`
            INSERT INTO chat_messages (id, conversation_id, role, content, created_at)
            VALUES (
              ${uuidv4()}, 
              ${actualConversationId}, 
              'assistant', 
              ${responseContent}, 
              NOW()
            )
          `;
        } catch (error) {
          console.error('Error saving AI message to database:', error);
        }
      }
    });

    // Return a streaming response with the conversation ID in the headers
    return new StreamingTextResponse(stream.pipeThrough(transformStream), {
      headers: { 'x-conversation-id': actualConversationId },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Error generating response' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
