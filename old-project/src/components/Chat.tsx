import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/services/conversation.service';
import { Avatar } from '@/components/Avatar';

interface ChatProps {
  conversationId?: number;
  onConversationCreated?: (id: number) => void;
}

export default function Chat({ conversationId, onConversationCreated }: ChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat with useChat hook
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit,
    setMessages,
    isLoading: isProcessing
  } = useChat({
    api: '/api/chat',
    body: conversationId ? { conversationId } : undefined,
    onResponse: (response) => {
      // Extract conversation ID from headers if this is a new conversation
      if (!conversationId) {
        const newConvId = parseInt(response.headers.get('X-Conversation-Id') || '0');
        if (newConvId && onConversationCreated) {
          onConversationCreated(newConvId);
        }
      }
      // Start the streaming state
      setIsStreaming(true);
    },
    onFinish: () => {
      // End the streaming state
      setIsStreaming(false);
    }
  });

  // Load existing conversation messages if a conversationId is provided
  useEffect(() => {
    if (!conversationId) {
      setMessages([]); // Clear messages for new conversation
      return;
    }

    const loadConversation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (!response.ok) throw new Error('Failed to fetch conversation');
        
        const conversation = await response.json();
        
        // Convert the messages to the format expected by useChat
        const formattedMessages = conversation.messages.map((message: Message) => ({
          id: message.id?.toString() || Math.random().toString(),
          role: message.role,
          content: message.content
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400 space-y-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-12 h-12 opacity-50"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
              />
            </svg>
            <div className="text-lg font-medium">Start a new conversation</div>
            <div className="text-center max-w-md">
              Type your message below to begin chatting with the AI assistant
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' 
                    ? 'justify-end' 
                    : 'justify-start'
                }`}
              >
                {message.role !== 'user' && <Avatar type="ai" />}
                
                <div
                  className={`p-4 rounded-xl max-w-3xl ${
                    message.role === 'user' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {message.role === 'user' && <Avatar type="user" />}
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar type="ai" />
                <div className="p-4 rounded-xl max-w-3xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 min-w-[60px] min-h-[40px]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={handleFormSubmit} className="flex">
          <input
            className="flex-1 border dark:border-gray-600 rounded-l-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading || isProcessing}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-r-xl px-6 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            type="submit"
            disabled={isLoading || isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center w-6 h-6">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
