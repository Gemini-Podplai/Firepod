import React, { useState, useRef, useEffect } from 'react';
import { useModel } from '../../context/ModelContext';
import './ModelSelector.css';

const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel, availableModels } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [tooltipModel, setTooltipModel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleModelSelect = (model: any) => {
    setSelectedModel(model);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = (modelId: string, e: React.MouseEvent) => {
    setTooltipModel(modelId);
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY + 10
    });
  };

  const handleMouseLeave = () => {
    setTooltipModel(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="model-selector-container" ref={dropdownRef}>
      <button
        className="model-selector-button"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="model-name">{selectedModel.name}</span>
        <svg
          className={`model-dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="model-dropdown" role="listbox">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className={`model-option ${selectedModel.id === model.id ? 'selected' : ''}`}
              role="option"
              aria-selected={selectedModel.id === model.id}
              onClick={() => handleModelSelect(model)}
              onMouseEnter={(e) => handleMouseEnter(model.id, e)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="model-option-content">
                <div className="model-option-name">{model.name}</div>
                {model.provider && (
                  <div className="model-option-provider">{model.provider}</div>
                )}
                {model.description && (
                  <div className="model-option-description">{model.description}</div>
                )}
              </div>
              {selectedModel.id === model.id && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="model-option-check"
                >
                  <path
                    d="M13.3332 4.33334L5.99984 11.6667L2.6665 8.33334"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {tooltipModel && (
        <div 
          className="model-tooltip"
          style={{ 
            top: `${tooltipPosition.y}px`, 
            left: `${tooltipPosition.x}px` 
          }}
        >
          {availableModels.find(model => model.id === tooltipModel)?.detailedInfo}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
