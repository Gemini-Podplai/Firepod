import React, { useState } from 'react';
import ResizablePanels from './ResizablePanels';
import TopNavBar from '../navigation/TopNavBar';
import EditorTabs from '../editor/EditorTabs';
import ChatContainer from '../chat/ChatContainer';
import './MainLayout.css';

const MainLayout = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
    // Apply theme changes to the document
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'light' : 'dark');
  };
  
  return (
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <TopNavBar 
        onThemeToggle={handleThemeToggle} 
        isDarkTheme={isDarkTheme} 
      />
      
      <ResizablePanels 
        leftPanel={<ChatContainer />} 
        rightPanel={<EditorTabs />} 
      />
    </div>
  );
};

export default MainLayout;
