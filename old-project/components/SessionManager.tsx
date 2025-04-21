import React, { useState } from 'react';
import { useSharedState } from './SharedStateProvider';

const SessionManager: React.FC = () => {
  const { state, clearSession, saveSession } = useSharedState();
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = () => {
    const success = saveSession();
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };
  
  return (
    <div className="session-manager">
      <div className="session-info">
        <div className="info-item">
          <span className="info-label">Current Model:</span>
          <span className="info-value">{state.modelParameters.modelName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Messages:</span>
          <span className="info-value">{state.conversationContext.messages.length}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Code Executions:</span>
          <span className="info-value">{state.executionHistory.length}</span>
        </div>
      </div>
      
      <div className="session-actions">
        <button 
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          {isSaved ? 'Saved!' : 'Save Session'}
        </button>
        <button 
          className="clear-button"
          onClick={() => {
            if (confirm('Are you sure you want to clear the current session?')) {
              clearSession();
            }
          }}
        >
          Clear Session
        </button>
      </div>
      
      <style jsx>{`
        .session-manager {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f9fafb;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .session-info {
          display: flex;
          gap: 1.5rem;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        
        .info-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }
        
        .session-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .save-button,
        .clear-button {
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .save-button {
          background-color: #2563eb;
          color: white;
          border: none;
        }
        
        .save-button:hover {
          background-color: #1d4ed8;
        }
        
        .save-button.saved {
          background-color: #10b981;
        }
        
        .clear-button {
          background-color: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }
        
        .clear-button:hover {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default SessionManager;
