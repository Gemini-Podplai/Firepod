import React, { useEffect, useState } from 'react';
import { Menu, Divider } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { DEFAULT_MODEL_ID } from '../types/model';
import NewChatButton from './NewChatButton';
import { ChatService } from '../services/chatService';
import '../styles/sidebar.css';

interface SidebarProps {
  currentModelId: string;
  currentChatId: string | null;
  onModelSelect: (modelId: string) => void;
  onChatSelect: (chatId: string) => void;
  onChatCreate: (chatState: ReturnType<typeof ChatService.createNewChat>) => void;
  chatState: any; // Replace with your actual chat state type
}

const Sidebar: React.FC<SidebarProps> = ({
  currentModelId,
  currentChatId,
  onModelSelect,
  onChatSelect,
  onChatCreate,
  chatState
}) => {
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  
  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);
  
  // Reload chat history when current chat changes
  useEffect(() => {
    if (currentChatId) {
      loadChatHistory();
    }
  }, [currentChatId]);
  
  const loadChatHistory = async () => {
    try {
      const chats = await ChatService.loadAllChats();
      setChatHistory(chats);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };
  
  const handleNewChat = () => {
    const newChat = ChatService.createNewChat(currentModelId || DEFAULT_MODEL_ID);
    onChatCreate(newChat);
  };
  
  const handleSaveCurrentChat = async () => {
    if (currentChatId && chatState && chatState.messages?.length > 0) {
      await ChatService.saveChat(chatState);
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <NewChatButton
          currentModelId={currentModelId}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSaveCurrentChat={handleSaveCurrentChat}
        />
      </div>
      
      <Divider className="sidebar-divider" />
      
      <div className="sidebar-content">
        <h3 className="sidebar-section-title">Recent Chats</h3>
        <Menu
          mode="vertical"
          selectedKeys={currentChatId ? [currentChatId] : []}
          className="chat-history-menu"
        >
          {chatHistory.map((chat) => (
            <Menu.Item 
              key={chat.id} 
              icon={<MessageOutlined />}
              onClick={() => onChatSelect(chat.id)}
            >
              {chat.title}
            </Menu.Item>
          ))}
        </Menu>
      </div>
    </div>
  );
};

export default Sidebar;
