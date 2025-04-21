import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { ChatMessage } from './ChatMessage';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ConversationHistory } from './ConversationHistory';
import { PaperPlaneIcon, Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ScrollArea } from './ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ChatProps {
  apiEndpoint?: string;
  modelName?: string;
}

export function Chat({ apiEndpoint = '/api/chat', modelName = 'gemini-1.5-pro' }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append
  } = useChat({
    api: apiEndpoint,
    id: currentConversationId,
    body: {
      modelName,
    },
    onResponse: (response) => {
      // Save the conversation ID when a new conversation starts
      const conversationId = response.headers.get('x-conversation-id');
      if (conversationId && !currentConversationId) {
        setCurrentConversationId(conversationId);
      }
    }
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    setInputValue('');
    await handleSubmit(e);
  };

  // Load conversation when selected from the sidebar
  const loadConversation = async (conversationId: string) => {
    try {
      setCurrentConversationId(conversationId);
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to load conversation');
      const data = await response.json();
      setMessages(data.messages);
      
      // Close mobile sidebar after selecting
      if (!isDesktop) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const renderChatHistory = () => (
    <ConversationHistory 
      onSelectConversation={loadConversation}
      currentConversationId={currentConversationId}
    />
  );

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      {isDesktop ? (
        <div className="w-64 border-r h-full hidden md:block">
          {renderChatHistory()}
        </div>
      ) : (
        // Mobile sidebar sheet
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-4 left-4 z-10">
              <span className="sr-only">Toggle History</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {renderChatHistory()}
          </SheetContent>
        </Sheet>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages display area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                modelName={modelName}
                timestamp={message.createdAt || new Date()}
              />
            ))}
            
            {isLoading && (
              <ChatMessage
                role="assistant"
                content=""
                modelName={modelName}
                timestamp={new Date()}
                isPending={true}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <form onSubmit={handleFormSubmit} className="border-t p-4">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleInputChange(e);
              }}
              placeholder="Type your message..."
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === ''}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PaperPlaneIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
