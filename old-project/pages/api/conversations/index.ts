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

    if (req.method === 'GET') {
      const userId = session.user.id;
      
      // Fetch conversations for the current user
      const { rows } = await sql`
        SELECT 
          c.id, 
          c.title, 
          c.created_at as timestamp,
          (
            SELECT content 
            FROM chat_messages 
            WHERE conversation_id = c.id 
            ORDER BY created_at ASC 
            LIMIT 1
          ) as summary
        FROM conversations c
        WHERE c.user_id = ${userId}
        ORDER BY c.created_at DESC
        LIMIT 50
      `;
      
      return res.status(200).json(rows);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing conversation request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
