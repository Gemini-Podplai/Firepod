import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/services/conversation.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationService = new ConversationService();
    const conversation = await conversationService.getConversation(parseInt(params.id));
    return NextResponse.json(conversation);
  } catch (error) {
    console.error(`Error fetching conversation ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await req.json();
    const conversationService = new ConversationService();
    await conversationService.updateConversationTitle(parseInt(params.id), title);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating conversation ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationService = new ConversationService();
    await conversationService.deleteConversation(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting conversation ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
