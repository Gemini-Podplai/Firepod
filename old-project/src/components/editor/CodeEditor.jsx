import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Loader, Save, Play } from 'lucide-react';
import './CodeEditor.css';

const CodeEditor = ({ 
  onExecuteCode, 
  initialValue = '// Write your JavaScript code here\nconsole.log("Hello world!");',
  language = 'javascript'
}) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  
  // Function to handle Monaco editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Optional: Set up additional editor configurations
    monaco.editor.defineTheme('podplai-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2d2d2d',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      }
    });
    
    monaco.editor.setTheme('podplai-dark');
  };
  
  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value || '');
  };
  
  // Save code (could be connected to a backend service)
  const handleSaveCode = async () => {
    if (!code) return;
    
    setIsSaving(true);
    try {
      // Here you would typically save to a backend
      localStorage.setItem('saved_code', code);
      
      // Visual feedback that save was successful
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error saving code:", error);
      setIsSaving(false);
    }
  };
  
  // Execute code using the parent-provided handler
  const executeCode = () => {
    if (onExecuteCode && code) {
      onExecuteCode(code);
    }
  };
  
  // Load saved code on first mount
  useEffect(() => {
    const savedCode = localStorage.getItem('saved_code');
    if (savedCode) {
      setCode(savedCode);
    }
  }, []);
  
  return (
    <div className="code-editor-container">
      <div className="editor-toolbar">
        <button 
          className="toolbar-button"
          onClick={handleSaveCode}
          disabled={isSaving}
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
        
        <button 
          className="toolbar-button run-button"
          onClick={executeCode}
        >
          <Play size={16} />
          <span>Run</span>
        </button>
      </div>
      
      <div className="monaco-editor-wrapper">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          loading={<div className="editor-loading"><Loader size={24} /></div>}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            renderLineHighlight: 'line'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
