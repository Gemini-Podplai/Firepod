import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import ChatArea from './components/ChatArea';
import TopBar from './components/TopBar';
import { ChatService, ChatState } from './services/chatService';
import { DEFAULT_MODEL_ID, ModelParameters, DEFAULT_PARAMETERS } from './types/model';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/theme.css';
import './styles/sidebar.css';
import './styles/parameters-tab.css';
import './styles/topbar.css';

const { Content, Sider } = Layout;

const App: React.FC = () => {
  const [currentModelId, setCurrentModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);

  useEffect(() => {
    const loadInitialChat = async () => {
      const initialChat = await ChatService.loadChat(currentChatId);
      setChatState(initialChat);
    };

    loadInitialChat();
  }, [currentChatId]);

  const handleModelSelect = (modelId: string) => {
    setCurrentModelId(modelId);
  };

  const loadChat = async (chatId: string) => {
    const chat = await ChatService.loadChat(chatId);
    setChatState(chat);
    setCurrentChatId(chatId);
  };

  const saveCurrentChat = async () => {
    if (chatState) {
      await ChatService.saveChat(chatState);
    }
  };

  const handleParametersChange = (newParameters: ModelParameters) => {
    setParameters(newParameters);
  };

  return (
    <ThemeProvider>
      <Layout style={{ height: '100vh' }}>
        <TopBar 
          currentModelId={currentModelId}
          onModelSelect={handleModelSelect}
        />
        <Layout>
          <Sider width={250} theme="light" className="app-sider">
            <Sidebar
              currentModelId={currentModelId}
              currentChatId={currentChatId}
              onModelSelect={handleModelSelect}
              onChatSelect={loadChat}
              onChatCreate={setChatState}
              chatState={chatState}
            />
          </Sider>
          <Content className="app-content">
            {chatState && (
              <ChatArea
                chat={chatState}
                onChatUpdate={setChatState}
                saveChat={saveCurrentChat}
              />
            )}
          </Content>
          <Sider width={300} theme="light" className="app-sider right-sider">
            <RightPanel onParametersChange={handleParametersChange} />
          </Sider>
        </Layout>
      </Layout>
    </ThemeProvider>
  );
};

export default App;