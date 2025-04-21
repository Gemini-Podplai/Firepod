'use client';

import Chat from '@/components/Chat';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  const handleConversationCreated = (newId: number) => {
    setSelectedConversationId(newId);
    fetchConversations(); // Refresh the conversation list
  };

  const deleteConversation = async (id: number) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete conversation');
      
      if (selectedConversationId === id) {
        setSelectedConversationId(undefined);
      }
      
      await fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar toggle button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 bg-gray-200 dark:bg-gray-700 p-2 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '←' : '→'}
      </button>

      {/* Conversations sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transform transition-transform duration-300 ease-in-out md:relative fixed z-10 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm overflow-y-auto`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Conversations</h2>
          <ThemeToggle />
        </div>
        
        <div className="p-2">
          <button 
            className="w-full bg-blue-500 dark:bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-600 dark:hover:bg-blue-700 mb-4 transition-colors"
            onClick={startNewConversation}
          >
            New Conversation
          </button>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center p-4">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedConversationId === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium truncate">{conversation.title}</div>
                  <button 
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-sm ml-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      fill="currentColor" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(conversation.updated_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold">
            {selectedConversationId 
              ? conversations.find(c => c.id === selectedConversationId)?.title || 'Loading...' 
              : 'New Conversation'}
          </h1>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <Chat 
            conversationId={selectedConversationId} 
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
}
