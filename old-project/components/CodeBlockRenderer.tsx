import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';

interface CodeBlockProps {
  code: string;
  language: string;
  onRunInSandbox: (code: string, language: string) => void;
  onExecuteCode?: (code: string, language: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  onRunInSandbox,
  onExecuteCode
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-block-language">{language}</span>
        <div className="code-block-actions">
          {onExecuteCode && (
            <button 
              className="execute-button"
              onClick={() => onExecuteCode(code, language)}
            >
              Execute
            </button>
          )}
          <button 
            className="run-sandbox-button"
            onClick={() => onRunInSandbox(code, language)}
          >
            Run in Sandbox
          </button>
        </div>
      </div>
      <pre className="code-block">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <style jsx>{`
        .code-block-container {
          margin: 1rem 0;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #374151;
        }
        .code-block-header {
          background-color: #1f2937;
          padding: 0.5rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #374151;
        }
        .code-block-language {
          color: #9ca3af;
          font-size: 0.875rem;
          text-transform: uppercase;
        }
        .code-block-actions {
          display: flex;
          gap: 0.5rem;
        }
        .execute-button {
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .execute-button:hover {
          background-color: #059669;
        }
        .run-sandbox-button {
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .run-sandbox-button:hover {
          background-color: #1d4ed8;
        }
        .code-block {
          margin: 0;
          padding: 1rem;
          background-color: #111827;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default CodeBlock;
