import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatPanel.css';

const ChatPanel = ({
  messages = [],
  onSendMessage,
  onNewChat,
  isLoading = false,
  streamingMessage = null
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };
  
  // Custom renderer components for markdown
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };
  
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h3>Start a new conversation</h3>
            <p>Ask a question or start typing to begin.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className="message-content">
                <ReactMarkdown 
                  components={renderers}
                  className="markdown-content"
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
        
        {streamingMessage && (
          <div className="message ai-message">
            <div className="message-avatar">AI</div>
            <div className="message-content">
              <ReactMarkdown 
                components={renderers}
                className="markdown-content"
              >
                {streamingMessage}
              </ReactMarkdown>
              <span className="cursor"></span>
            </div>
          </div>
        )}
        
        {isLoading && !streamingMessage && (
          <div className="message ai-message">
            <div className="message-avatar">AI</div>
            <div className="message-content typing-indicator">
              <Loader size={16} className="spinner" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-form">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
