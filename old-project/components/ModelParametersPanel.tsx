import React from 'react';
import { useSharedState } from './SharedStateProvider';
import { ModelParameters } from '../services/CodeExecutionService';

const ModelParametersPanel: React.FC = () => {
  const { state, updateModelParameters } = useSharedState();
  const { modelParameters } = state;
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateModelParameters({ modelName: e.target.value });
  };
  
  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    param: keyof ModelParameters
  ) => {
    const value = parseFloat(e.target.value);
    updateModelParameters({ [param]: value });
  };
  
  return (
    <div className="parameters-panel">
      <h2>Model Parameters</h2>
      
      <div className="parameter-group">
        <label htmlFor="model-select">Model</label>
        <select 
          id="model-select"
          value={modelParameters.modelName}
          onChange={handleModelChange}
          className="model-select"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
      </div>
      
      <div className="parameter-group">
        <div className="parameter-label">
          <label htmlFor="temperature">Temperature</label>
          <span className="parameter-value">{modelParameters.temperature.toFixed(2)}</span>
        </div>
        <input
          id="temperature"
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={modelParameters.temperature}
          onChange={(e) => handleSliderChange(e, 'temperature')}
          className="parameter-slider"
        />
        <div className="parameter-range">
          <span>Precise</span>
          <span>Balanced</span>
          <span>Creative</span>
        </div>
      </div>
      
      <div className="parameter-group">
        <div className="parameter-label">
          <label htmlFor="maxTokens">Max Tokens</label>
          <span className="parameter-value">{modelParameters.maxTokens}</span>
        </div>
        <input
          id="maxTokens"
          type="range"
          min="100"
          max="8000"
          step="100"
          value={modelParameters.maxTokens}
          onChange={(e) => handleSliderChange(e, 'maxTokens')}
          className="parameter-slider"
        />
      </div>
      
      <div className="parameter-group">
        <div className="parameter-label">
          <label htmlFor="topP">Top P</label>
          <span className="parameter-value">{modelParameters.topP.toFixed(2)}</span>
        </div>
        <input
          id="topP"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={modelParameters.topP}
          onChange={(e) => handleSliderChange(e, 'topP')}
          className="parameter-slider"
        />
      </div>
      
      <div className="parameter-group">
        <div className="parameter-label">
          <label htmlFor="frequencyPenalty">Frequency Penalty</label>
          <span className="parameter-value">{modelParameters.frequencyPenalty.toFixed(2)}</span>
        </div>
        <input
          id="frequencyPenalty"
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={modelParameters.frequencyPenalty}
          onChange={(e) => handleSliderChange(e, 'frequencyPenalty')}
          className="parameter-slider"
        />
      </div>
      
      <div className="parameter-group">
        <div className="parameter-label">
          <label htmlFor="presencePenalty">Presence Penalty</label>
          <span className="parameter-value">{modelParameters.presencePenalty.toFixed(2)}</span>
        </div>
        <input
          id="presencePenalty"
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={modelParameters.presencePenalty}
          onChange={(e) => handleSliderChange(e, 'presencePenalty')}
          className="parameter-slider"
        />
      </div>
      
      <div className="session-actions">
        <button
          className="save-session-button"
          onClick={() => {
            const success = useSharedState().saveSession();
            if (success) {
              alert('Session saved successfully!');
            } else {
              alert('Failed to save session.');
            }
          }}
        >
          Save Session
        </button>
        
        <button
          className="clear-session-button"
          onClick={() => {
            if (confirm('Are you sure you want to clear the current session?')) {
              useSharedState().clearSession();
            }
          }}
        >
          Clear Session
        </button>
      </div>
      
      <style jsx>{`
        .parameters-panel {
          padding: 1.5rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        
        .parameter-group {
          margin-bottom: 1.5rem;
        }
        
        .parameter-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
        }
        
        .parameter-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #2563eb;
        }
        
        .parameter-slider {
          width: 100%;
          margin-bottom: 0.5rem;
        }
        
        .parameter-range {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .model-select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background-color: white;
          font-size: 0.875rem;
          color: #111827;
          margin-top: 0.5rem;
        }
        
        .session-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
        }
        
        .save-session-button,
        .clear-session-button {
          flex: 1;
          padding: 0.625rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .save-session-button {
          background-color: #2563eb;
          color: white;
          border: none;
        }
        
        .save-session-button:hover {
          background-color: #1d4ed8;
        }
        
        .clear-session-button {
          background-color: white;
          color: #ef4444;
          border: 1px solid #ef4444;
        }
        
        .clear-session-button:hover {
          background-color: #fef2f2;
        }
      `}</style>
    </div>
  );
};

export default ModelParametersPanel;
