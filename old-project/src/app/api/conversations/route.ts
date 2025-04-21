import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/services/conversation.service';

export async function GET() {
  try {
    const conversationService = new ConversationService();
    const conversations = await conversationService.getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    const conversationService = new ConversationService();
    const id = await conversationService.createConversation(title || 'New Conversation');
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
