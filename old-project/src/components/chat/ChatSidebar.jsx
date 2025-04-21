import React from 'react';
import { Plus, Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import './ChatSidebar.css';

const ChatSidebar = ({ 
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  selectedModel,
  onModelChange
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);
  
  const modelOptions = [
    'Gemini 2.5 Pro',
    'Gemini 2.0 Flash',
    'Gemini 1.5 Pro',
    'Gemini 1.5 Flash'
  ];
  
  const toggleModelDropdown = () => {
    setModelDropdownOpen(!modelDropdownOpen);
  };
  
  const handleModelSelect = (model) => {
    onModelChange(model);
    setModelDropdownOpen(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={16} />
          <span>New Chat</span>
        </button>
        
        <div className="model-selector-container">
          <button className="model-dropdown-button" onClick={toggleModelDropdown}>
            <span>Model: {selectedModel}</span>
            <ChevronDown size={16} className={modelDropdownOpen ? 'rotate-180' : ''} />
          </button>
          
          {modelDropdownOpen && (
            <div className="model-dropdown">
              {modelOptions.map((model) => (
                <div 
                  key={model}
                  className={`model-option ${model === selectedModel ? 'selected' : ''}`}
                  onClick={() => handleModelSelect(model)}
                >
                  {model}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="empty-conversations">
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div 
              key={conversation.id}
              className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="conversation-icon">
                <MessageSquare size={16} />
              </div>
              <div className="conversation-details">
                <div className="conversation-title">{conversation.title}</div>
                <div className="conversation-date">{formatDate(conversation.updated_at)}</div>
              </div>
              <button 
                className="delete-conversation-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
