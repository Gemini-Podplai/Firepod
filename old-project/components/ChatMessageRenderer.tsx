import React from 'react';
import CodeBlock from './CodeBlockRenderer';

interface ChatMessageRendererProps {
  message: string;
  sendToEditor: (code: string, language: string) => void;
  executeCode?: (code: string, language: string) => void;
}

const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ 
  message, 
  sendToEditor,
  executeCode
}) => {
  // Regular expression to detect markdown code blocks
  // Matches ```language\ncode``` pattern
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  // Split the message into text and code blocks
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let match;
  
  while ((match = codeBlockRegex.exec(message)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {message.substring(lastIndex, match.index)}
        </span>
      );
    }
    
    // Add the code block
    const language = match[1] || 'plaintext';
    const code = match[2];
    
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        code={code}
        language={language}
        onRunInSandbox={sendToEditor}
        onExecuteCode={executeCode}
      />
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text after the last code block
  if (lastIndex < message.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {message.substring(lastIndex)}
      </span>
    );
  }
  
  return <div className="chat-message">{parts}</div>;
};

export default ChatMessageRenderer;
