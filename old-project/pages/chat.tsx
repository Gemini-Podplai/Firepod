import React, { useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import ChatContainer from '../components/ChatContainer';
import ModelParametersPanel from '../components/ModelParametersPanel';
import SessionManager from '../components/SessionManager';
import { useSharedState } from '../components/SharedStateProvider';
import { ExecutionResult } from '../services/CodeExecutionService';

// Dynamically import the editor component with no SSR
const CodeEditor = dynamic(
  () => import('../components/CodeEditor'),
  { ssr: false }
);

const ChatPage: React.FC = () => {
  const { state, executeCode } = useSharedState();
  const chatContainerRef = React.useRef<any>(null);
  
  // Function to send code from chat to editor - now uses shared state
  const handleSendCodeToEditor = (code: string, language: string) => {
    // Update shared state
    useSharedState().state.currentCode = { content: code, language };
  };

  // Function to handle execution results
  const handleExecutionResults = (results: ExecutionResult[]) => {
    if (chatContainerRef.current && chatContainerRef.current.handleExecutionResult) {
      chatContainerRef.current.handleExecutionResult(results);
    }
  };
  
  // Effect to handle browser compatibility
  useEffect(() => {
    const checkBrowserCompatibility = () => {
      // Feature detection for key features
      const features = {
        localStorage: typeof localStorage !== 'undefined',
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined'
      };
      
      const incompatibleFeatures = Object.entries(features)
        .filter(([_, supported]) => !supported)
        .map(([feature]) => feature);
      
      if (incompatibleFeatures.length > 0) {
        console.warn(
          `Your browser may not fully support some features: ${incompatibleFeatures.join(', ')}`
        );
      }
    };
    
    checkBrowserCompatibility();
  }, []);
  
  return (
    <div className="page-container">
      <Head>
        <title>Chat with Code Sandbox</title>
        <meta name="description" content="Chat with code sandbox functionality" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <SessionManager />
      
      <main className="main-content">
        <div className="layout-container">
          <div className="chat-panel">
            <div className="panel-header">
              <h1 className="panel-title">Chat</h1>
              {useSharedState().currentModelIndicator}
            </div>
            <ChatContainer 
              ref={chatContainerRef}
              sendCodeToEditor={handleSendCodeToEditor} 
            />
          </div>
          
          <div className="right-column">
            <div className="editor-panel">
              <h1 className="panel-title">Sandbox Editor</h1>
              <CodeEditor 
                code={state.currentCode.content} 
                language={state.currentCode.language} 
                onChange={(value) => {
                  // Update via shared state
                  useSharedState().state.currentCode.content = value;
                }}
                onExecutionResult={handleExecutionResults}
              />
            </div>
            
            <ModelParametersPanel />
          </div>
        </div>
      </main>
      
      <div className="help-button">
        <button className="get-help" onClick={() => {
          // Add a message to chat asking for help with the current code
          useSharedState().addChatMessage(
            `I need help with this code:\n\n\`\`\`${state.currentCode.language}\n${state.currentCode.content}\n\`\`\``, 
            true
          );
        }}>
          Get Help
        </button>
      </div>
      
      <style jsx>{`
        .page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .layout-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          height: calc(100vh - 4rem - 50px); /* Adjust for SessionManager height */
          flex: 1;
        }
        
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .right-column {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .editor-panel {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .panel-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }
        
        .help-button {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 50;
        }
        
        .get-help {
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }
        
        .get-help:hover {
          background-color: #1d4ed8;
          transform: translateY(-2px);
        }
        
        .get-help:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .layout-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
