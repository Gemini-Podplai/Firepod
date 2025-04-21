import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { ChatService } from '../services/chatService';

interface NewChatButtonProps {
  currentModelId: string;
  currentChatId: string | null;
  onNewChat: () => void;
  onSaveCurrentChat: () => Promise<void>;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({
  currentModelId,
  currentChatId,
  onNewChat,
  onSaveCurrentChat
}) => {
  const handleNewChat = async () => {
    try {
      // If there's an existing chat, save it first
      if (currentChatId) {
        await onSaveCurrentChat();
      }
      
      // Create new chat
      onNewChat();
    } catch (error) {
      console.error('Failed to create new chat:', error);
      // Add error notification here if you have a notification system
    }
  };

  return (
    <Tooltip title="Start a new chat">
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleNewChat}
        className="new-chat-button"
      >
        New Chat
      </Button>
    </Tooltip>
  );
};

export default NewChatButton;
