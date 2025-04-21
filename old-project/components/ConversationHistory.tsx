import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
}

interface ConversationHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export function ConversationHistory({
  onSelectConversation,
  currentConversationId
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <h2 className="font-semibold text-lg mb-4">Conversations</h2>
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold text-lg">Conversations</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchConversations}
          disabled={refreshing}
          title="Refresh conversations"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left p-3 mb-2 rounded-md hover:bg-accent transition-colors
                  ${currentConversationId === conversation.id ? 'bg-accent' : ''}`}
              >
                <div className="font-medium truncate">{conversation.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {conversation.summary}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(conversation.timestamp))} ago
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
