import React from 'react';
import { ExecutionResult as ExecutionResultType } from '../services/CodeExecutionService';

interface ExecutionResultProps {
  result: ExecutionResultType;
}

const ExecutionResult: React.FC<ExecutionResultProps> = ({ result }) => {
  switch (result.type) {
    case 'text':
      return (
        <div className="result-text">
          <pre>{result.content}</pre>
          <style jsx>{`
            .result-text {
              padding: 0.75rem;
              background-color: #f9fafb;
              border-radius: 4px;
              border-left: 4px solid #10b981;
              font-family: monospace;
              white-space: pre-wrap;
              word-break: break-word;
              margin: 0.5rem 0;
            }
            pre {
              margin: 0;
            }
          `}</style>
        </div>
      );
      
    case 'error':
      return (
        <div className="result-error">
          <pre>{result.content}</pre>
          <style jsx>{`
            .result-error {
              padding: 0.75rem;
              background-color: #fef2f2;
              border-radius: 4px;
              border-left: 4px solid #ef4444;
              font-family: monospace;
              white-space: pre-wrap;
              word-break: break-word;
              margin: 0.5rem 0;
            }
            pre {
              margin: 0;
              color: #b91c1c;
            }
          `}</style>
        </div>
      );
      
    case 'image':
      return (
        <div className="result-image">
          <img 
            src={`data:${result.mimeType || 'image/png'};base64,${result.content}`}
            alt="Execution result"
          />
          <style jsx>{`
            .result-image {
              margin: 0.5rem 0;
              text-align: center;
            }
            img {
              max-width: 100%;
              max-height: 300px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
          `}</style>
        </div>
      );
      
    default:
      return null;
  }
};

export default ExecutionResult;
