import React, { useState, useRef, useEffect } from 'react';
import { GEMINI_MODELS, generateGeminiStreamingResponse, processGeminiStream } from '../services/geminiService';
import { DEFAULT_SETTINGS } from '../config';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(GEMINI_MODELS.GEMINI_PRO);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModelChange = (e) => {
    setCurrentModel(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message that will be updated during streaming
    const assistantMessageId = Date.now().toString();
    setMessages(prevMessages => [
      ...prevMessages, 
      { role: 'assistant', content: '', id: assistantMessageId, isStreaming: true }
    ]);

    try {
      const stream = await generateGeminiStreamingResponse(input, currentModel, DEFAULT_SETTINGS);

      await processGeminiStream(
        stream,
        (chunk) => {
          setMessages(prevMessages => {
            return prevMessages.map(msg => {
              if (msg.id === assistantMessageId) {
                return { ...msg, content: msg.content + chunk };
              }
              return msg;
            });
          });
        }
      );

      // Mark streaming as complete
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === assistantMessageId) {
            return { ...msg, isStreaming: false };
          }
          return msg;
        });
      });

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prevMessages => [
        ...prevMessages.filter(msg => msg.id !== assistantMessageId),
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Chat with Gemini</h1>
        <div className="flex items-center">
          <select 
            className="bg-gray-700 text-white px-3 py-2 rounded-md"
            value={currentModel}
            onChange={handleModelChange}
            disabled={isLoading}
          >
            <option value={GEMINI_MODELS.GEMINI_PRO}>Gemini Pro</option>
            <option value={GEMINI_MODELS.GEMINI_PRO_VISION}>Gemini Pro Vision</option>
            <option value={GEMINI_MODELS.GEMINI_1_5_PRO}>Gemini 1.5 Pro</option>
            <option value={GEMINI_MODELS.GEMINI_1_5_FLASH}>Gemini 1.5 Flash</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.isStreaming && <span className="ml-1 animate-pulse">▌</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-md focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            className={`px-4 py-2 rounded-r-md text-white ${
              isLoading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}