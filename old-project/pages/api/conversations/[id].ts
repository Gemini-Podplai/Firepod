import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const userId = session.user.id;
    
    if (req.method === 'GET') {
      // Check if conversation belongs to user
      const { rows: conversationRows } = await sql`
        SELECT id FROM conversations 
        WHERE id = ${id as string} AND user_id = ${userId}
      `;
      
      if (conversationRows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Fetch messages for the conversation
      const { rows: messageRows } = await sql`
        SELECT 
          id,
          role,
          content,
          created_at as "createdAt"
        FROM chat_messages 
        WHERE conversation_id = ${id as string}
        ORDER BY created_at ASC
      `;
      
      return res.status(200).json({ 
        id, 
        messages: messageRows 
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing conversation request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
