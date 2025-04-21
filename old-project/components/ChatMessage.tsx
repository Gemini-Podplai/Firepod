import React from 'react';
import ChatMessageRenderer from './ChatMessageRenderer';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
  sendToEditor: (code: string, language: string) => void;
  executeCode?: (code: string, language: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  content, 
  isUser, 
  timestamp,
  sendToEditor,
  executeCode
}) => {
  return (
    <div className={`chat-message-container ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-message-header">
        <span className="chat-message-sender">{isUser ? 'You' : 'Assistant'}</span>
        <span className="chat-message-time">{timestamp}</span>
      </div>
      <div className="chat-message-content">
        <ChatMessageRenderer 
          message={content} 
          sendToEditor={sendToEditor} 
          executeCode={executeCode}
        />
      </div>
      <style jsx>{`
        .chat-message-container {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .chat-message-container.user {
          background-color: #f3f4f6;
        }
        .chat-message-container.assistant {
          background-color: #eff6ff;
        }
        .chat-message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .chat-message-sender {
          font-weight: 600;
        }
        .chat-message-time {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .chat-message-content {
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;
