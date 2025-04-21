import React from 'react';
import ExecutionResult from './ExecutionResult';
import { ExecutionResult as ExecutionResultType } from '../services/CodeExecutionService';

interface ExecutionResultsDisplayProps {
  results: ExecutionResultType[];
}

const ExecutionResultsDisplay: React.FC<ExecutionResultsDisplayProps> = ({ results }) => {
  if (!results || results.length === 0) return null;
  
  return (
    <div className="execution-results">
      <div className="results-header">
        <span>Execution Results</span>
      </div>
      <div className="results-container">
        {results.map((result, index) => (
          <ExecutionResult key={index} result={result} />
        ))}
      </div>
      <style jsx>{`
        .execution-results {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin: 0.5rem 0 1rem;
          overflow: hidden;
        }
        .results-header {
          background-color: #f9fafb;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
        }
        .results-container {
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ExecutionResultsDisplay;
