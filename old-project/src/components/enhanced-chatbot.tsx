import React, { useState } from 'react';
import { toast } from 'react-toastify';

const EnhancedChatbot = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    try {
      console.log("Sending message:", inputMessage);
      
      if (!inputMessage.trim()) {
        console.log("Empty message, not sending");
        return;
      }
      
      setIsLoading(true);
      console.log("Setting loading state to true");
      
      const userMessage = { role: "user", content: inputMessage };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      console.log("Added user message to chat history");
      
      setInputMessage("");
      console.log("Cleared input field");
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received response data:", data);
      
      setMessages([...newMessages, data.message]);
      console.log("Added AI response to chat history");
      
      setIsLoading(false);
      console.log("Setting loading state to false");
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.content}</div>
        ))}
      </div>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <button onClick={handleSendMessage} disabled={isLoading}>
        Send
      </button>
    </div>
  );
};

export default EnhancedChatbot;