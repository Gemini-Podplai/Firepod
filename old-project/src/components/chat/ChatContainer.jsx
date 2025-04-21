import React, { useState, useEffect } from 'react';
import ChatPanel from './ChatPanel';
import chatService from '../../services/chatService';
import databaseService from '../../services/databaseService';
import ChatSidebar from './ChatSidebar';
import './ChatContainer.css';

const ChatContainer = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Pro');
  
  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);
  
  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);
  
  // Load all conversations from the database
  const loadConversations = async () => {
    try {
      const data = await databaseService.getConversations();
      setConversations(data);
      
      // If there's at least one conversation, set it as active
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };
  
  // Load messages for a specific conversation
  const loadMessages = async (conversationId) => {
    try {
      const messageData = await databaseService.getMessages(conversationId);
      
      // Transform database message format to chat component format
      const formattedMessages = messageData.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error(`Error loading messages for conversation ${conversationId}:`, error);
    }
  };
  
  // Create a new conversation
  const handleNewChat = async () => {
    try {
      const newConversation = await databaseService.createConversation("New Conversation", selectedModel);
      setConversations([newConversation, ...conversations]);
      setActiveConversationId(newConversation.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };
  
  // Delete a conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      await databaseService.deleteConversation(conversationId);
      
      // Remove from state
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      setConversations(updatedConversations);
      
      // If the active conversation was deleted, select another one or clear
      if (activeConversationId === conversationId) {
        if (updatedConversations.length > 0) {
          setActiveConversationId(updatedConversations[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error(`Error deleting conversation ${conversationId}:`, error);
    }
  };
  
  // Select a conversation
  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
  };
  
  // Change the AI model
  const handleModelChange = (modelName) => {
    setSelectedModel(modelName);
    chatService.setModel(modelName);
  };
  
  // Send a message and get streaming response
  const handleSendMessage = async (text) => {
    if (!activeConversationId) {
      // Create a new conversation if none exists
      try {
        const newConversation = await databaseService.createConversation("New Conversation", selectedModel);
        setConversations([newConversation, ...conversations]);
        setActiveConversationId(newConversation.id);
        
        // Continue with sending the message
        sendMessageToAPI(newConversation.id, text);
      } catch (error) {
        console.error("Error creating new conversation:", error);
      }
    } else {
      // Use existing conversation
      sendMessageToAPI(activeConversationId, text);
    }
  };
  
  // Helper function to send message to API
  const sendMessageToAPI = async (conversationId, text) => {
    try {
      // Add user message to UI and database
      const userMessage = { role: 'user', content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Save user message to database
      await databaseService.addMessage(conversationId, 'user', text);
      
      // If this is the first message, update the conversation title
      if (messages.length === 0) {
        await databaseService.generateConversationTitle(conversationId);
        // Refresh conversation list to show the new title
        loadConversations();
      }
      
      // Set loading state
      setIsLoading(true);
      setStreamingMessage('');
      
      // Stream the AI response
      await chatService.streamMessage(
        updatedMessages,
        (partialResponse) => {
          setStreamingMessage(partialResponse);
        }
      ).then(async (response) => {
        // Reset loading and streaming state
        setIsLoading(false);
        setStreamingMessage(null);
        
        // Add AI response to messages state
        setMessages([...updatedMessages, response]);
        
        // Save AI response to database
        await databaseService.addMessage(conversationId, 'assistant', response.content);
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      setStreamingMessage(null);
      
      // Add error message to chat
      setMessages([...messages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };
  
  return (
    <div className="chat-container">
      <ChatSidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
      
      <div className="active-chat">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onNewChat={handleNewChat}
          isLoading={isLoading}
          streamingMessage={streamingMessage}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
