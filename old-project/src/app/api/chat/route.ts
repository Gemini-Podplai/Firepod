import { NextRequest, NextResponse } from 'next/server';
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BytesOutputParser } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';
import { ConversationService } from '@/services/conversation.service';

export const runtime = 'edge';

/**
 * Basic memory formatter that concatenates all messages with newlines
 */
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: NextRequest) {
  try {
    // Extract the messages and conversationId from the request body
    const { messages, conversationId } = await req.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage).join('\n');
    const currentMessageContent = messages[messages.length - 1].content;

    // Initialize conversation service
    const conversationService = new ConversationService();
    
    // Determine if this is a new conversation or existing one
    let actualConversationId = conversationId;
    if (!actualConversationId) {
      // Create a new conversation with a title based on the first user message
      const title = currentMessageContent.substring(0, 50) + (currentMessageContent.length > 50 ? '...' : '');
      actualConversationId = await conversationService.createConversation(title);
    }

    // Save the user message to the database
    await conversationService.saveMessage(actualConversationId, {
      role: 'user',
      content: currentMessageContent
    });
    
    // Prepare the prompt for the AI
    const prompt = PromptTemplate.fromTemplate(`
      You are an AI assistant having a conversation with a human.

      Previous messages:
      {previous_messages}

      Human: {current_message}
      AI:
    `);

    // Initialize the language model
    const model = new ChatOpenAI({
      temperature: 0.7,
      streaming: true
    });

    // Format the prompt with the current conversation context
    const formattedPrompt = await prompt.format({
      previous_messages: formattedPreviousMessages,
      current_message: currentMessageContent,
    });

    // Parse the streaming output from the AI
    const outputParser = new BytesOutputParser();

    // Execute the prompt and get the AI response as a stream
    const stream = await model
      .pipe(outputParser)
      .stream(formattedPrompt);

    // Create an AbortController to handle any errors during streaming
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let responseContent = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const text = decoder.decode(value);
            responseContent += text;
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Stream reading error:', error);
          controller.error(error);
        } finally {
          try {
            // Save the AI response to the database
            await conversationService.saveMessage(actualConversationId, {
              role: 'assistant',
              content: responseContent
            });
          } catch (dbError) {
            console.error('Failed to save AI message:', dbError);
          }
          controller.close();
        }
      }
    });

    // Return the streaming response with the conversationId included in headers
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('X-Conversation-Id', actualConversationId.toString());

    return new StreamingTextResponse(responseStream, { headers });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
  }
}
