import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { CodeExecutionService, ExecutionResult } from '../services/CodeExecutionService';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onExecutionResult?: (results: ExecutionResult[]) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language, 
  onChange, 
  onExecutionResult 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  useEffect(() => {
    if (editorRef.current) {
      // Dispose previous instance if it exists
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
      
      // Create editor
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: code,
        language: language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
          enabled: false
        }
      });
      
      // Add change event listener
      monacoEditorRef.current.onDidChangeModelContent(() => {
        onChange(monacoEditorRef.current?.getValue() || '');
      });
    }
    
    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, []);
  
  // Update the editor when the code or language prop changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
      
      // Only update if the editor value is different from the current code
      if (monacoEditorRef.current.getValue() !== code) {
        monacoEditorRef.current.setValue(code);
      }
    }
  }, [code, language]);

  const handleRunCode = async () => {
    if (!monacoEditorRef.current) return;
    
    const codeToExecute = monacoEditorRef.current.getValue();
    setIsExecuting(true);
    
    try {
      const results = await CodeExecutionService.executeCode(codeToExecute, language);
      if (onExecutionResult) {
        onExecutionResult(results);
      }
    } catch (error: any) {
      if (onExecutionResult) {
        onExecutionResult([{
          type: 'error',
          content: error.message || 'An unknown error occurred'
        }]);
      }
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <span className="language-indicator">{language.toUpperCase()}</span>
        <button 
          className={`run-button ${isExecuting ? 'executing' : ''}`} 
          onClick={handleRunCode}
          disabled={isExecuting}
        >
          {isExecuting ? 'Executing...' : 'Run Code'}
        </button>
      </div>
      <div ref={editorRef} className="monaco-editor" />
      <style jsx>{`
        .editor-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          border: 1px solid #374151;
          border-radius: 6px;
          overflow: hidden;
        }
        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #1f2937;
          border-bottom: 1px solid #374151;
        }
        .language-indicator {
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .run-button {
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .run-button:hover:not(:disabled) {
          background-color: #059669;
        }
        .run-button.executing {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        .run-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .monaco-editor {
          flex: 1;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
