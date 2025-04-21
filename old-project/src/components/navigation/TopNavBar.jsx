import React, { useState } from 'react';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import './TopNavBar.css';

const TopNavBar = ({ onThemeToggle, isDarkTheme = true }) => {
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Pro');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const modelOptions = [
    'Gemini 2.5 Pro',
    'Gemini 2.0 Flash',
    'Gemini 1.5 Pro',
    'Gemini 1.5 Flash'
  ];
  
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };
  
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <div className="app-logo">PodplAI Studio</div>
      </div>
      
      <div className="nav-center">
        <div 
          className="model-selector"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>{selectedModel}</span>
          <ChevronDown size={16} />
          
          {isDropdownOpen && (
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
      
      <div className="nav-right">
        <button 
          className="theme-toggle" 
          onClick={onThemeToggle}
          aria-label="Toggle theme"
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default TopNavBar;
