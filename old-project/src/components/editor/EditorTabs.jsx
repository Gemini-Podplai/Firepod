import React, { useState, useRef } from 'react';
import CodeEditor from './CodeEditor';
import CodeExecutionSandbox from '../sandbox/CodeExecutionSandbox';
import './EditorTabs.css';

const EditorTabs = ({ defaultTab = 'code' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const sandboxRef = useRef(null);
  const [currentCode, setCurrentCode] = useState('');
  
  // Function to execute code in the sandbox
  const executeCode = (code) => {
    setCurrentCode(code);
    // Switch to the preview tab to see results
    setActiveTab('preview');
    // Execute the code in the sandbox
    if (sandboxRef.current && sandboxRef.current.executeCode) {
      sandboxRef.current.executeCode(code);
    }
  };
  
  // Sample parameters component (you can expand this later)
  const ParametersPanel = () => (
    <div className="parameters-panel">
      <h3>Code Parameters</h3>
      <div className="parameters-form">
        <div className="parameter-group">
          <label>Environment:</label>
          <select defaultValue="browser">
            <option value="browser">Browser</option>
            <option value="node">Node.js</option>
          </select>
        </div>
        <div className="parameter-group">
          <label>JavaScript Version:</label>
          <select defaultValue="es2020">
            <option value="es2015">ES2015 (ES6)</option>
            <option value="es2020">ES2020</option>
            <option value="latest">Latest</option>
          </select>
        </div>
        <div className="parameter-group">
          <label>Timeout (ms):</label>
          <input type="number" defaultValue="5000" min="1000" max="10000" step="1000" />
        </div>
      </div>
    </div>
  );
  
  // Map of tab content components
  const tabContents = {
    code: <CodeEditor onExecuteCode={executeCode} />,
    preview: <CodeExecutionSandbox code={currentCode} ref={sandboxRef} />,
    parameters: <ParametersPanel />
  };
  
  return (
    <div className="editor-tabs-container">
      <div className="tabs-header">
        <button 
          className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Code Editor
        </button>
        <button 
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button 
          className={`tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Parameters
        </button>
      </div>
      
      <div className="tab-content">
        {tabContents[activeTab]}
      </div>
    </div>
  );
};

export default EditorTabs;
