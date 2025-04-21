import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ConsolePanelOutput } from './ConsolePanelOutput';
import { consoleInterceptor, LogEntry } from '../utils/consoleInterceptor';
import { highlightSyntaxErrors } from '../utils/syntaxErrorHighlighter';

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface CodeSandboxProps {
  initialCode?: string;
  language?: string;
  theme?: string;
  height?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

const CodeSandbox: React.FC<CodeSandboxProps> = ({
  initialCode = "// Start coding here\nconsole.log('Hello, world!');",
  language = "javascript",
  theme = "vs-dark",
  height = "400px",
  onCodeChange,
  readOnly = false,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const editorRef = useRef<any>(null);
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Add a listener to capture console logs
    const removeListener = consoleInterceptor.addListener((entry) => {
      setLogs(prevLogs => [...prevLogs, entry]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Enable real-time syntax checking
    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();
      setCode(currentCode);
      highlightSyntaxErrors(editor, currentCode, language);
      
      if (onCodeChange) {
        onCodeChange(currentCode);
      }
    });
    
    // Initial syntax check
    highlightSyntaxErrors(editor, code, language);
  };

  const executeCode = () => {
    // Clear previous logs
    setLogs([]);
    
    try {
      // Create a sandboxed iframe to run the code
      const iframe = iframeRef.current;
      
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <html>
              <head>
                <script>
                  // Setup console interceptor in the iframe
                  window.onerror = function(message, source, lineno, colno, error) {
                    window.parent.postMessage({
                      type: 'error',
                      content: message + ' (line: ' + lineno + ', column: ' + colno + ')',
                      timestamp: new Date().toISOString()
                    }, '*');
                    return true;
                  };
                  
                  // Override console methods
                  const originalConsole = {
                    log: console.log,
                    error: console.error,
                    warn: console.warn,
                    info: console.info
                  };
                  
                  console.log = function() {
                    const args = Array.from(arguments);
                    window.parent.postMessage({
                      type: 'log',
                      content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
                      timestamp: new Date().toISOString()
                    }, '*');
                    originalConsole.log.apply(console, args);
                  };
                  
                  console.error = function() {
                    const args = Array.from(arguments);
                    window.parent.postMessage({
                      type: 'error',
                      content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
                      timestamp: new Date().toISOString()
                    }, '*');
                    originalConsole.error.apply(console, args);
                  };
                  
                  console.warn = function() {
                    const args = Array.from(arguments);
                    window.parent.postMessage({
                      type: 'warn',
                      content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
                      timestamp: new Date().toISOString()
                    }, '*');
                    originalConsole.warn.apply(console, args);
                  };
                  
                  console.info = function() {
                    const args = Array.from(arguments);
                    window.parent.postMessage({
                      type: 'info',
                      content: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
                      timestamp: new Date().toISOString()
                    }, '*');
                    originalConsole.info.apply(console, args);
                  };
                </script>
              </head>
              <body>
                <script>
                  try {
                    ${code}
                  } catch (error) {
                    console.error('Execution error:', error.message);
                  }
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setLogs(prevLogs => [...prevLogs, {
          type: 'error',
          content: `Execution error: ${error.message}`,
          timestamp: new Date()
        }]);
      }
    }
  };

  const clearConsole = () => {
    setLogs([]);
  };

  // Setup message event listener for iframe communications
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        const { type, content, timestamp } = event.data;
        setLogs(prevLogs => [...prevLogs, {
          type: type as 'log' | 'error' | 'warn' | 'info',
          content,
          timestamp: new Date(timestamp)
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="flex flex-col border rounded-md overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
        <div className="text-sm font-medium text-white">Code Editor</div>
        <div>
          <button 
            onClick={executeCode}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm mr-2"
          >
            Run
          </button>
          <button 
            onClick={() => setShowConsole(!showConsole)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
          >
            {showConsole ? 'Hide Console' : 'Show Console'}
          </button>
        </div>
      </div>
      
      <div style={{ height }}>
        <MonacoEditor
          height="100%"
          language={language}
          theme={theme}
          value={code}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            scrollbar: {
              alwaysConsumeMouseWheel: false
            }
          }}
          onMount={handleEditorDidMount}
        />
      </div>

      {showConsole && (
        <div className="border-t border-gray-700">
          <ConsolePanelOutput 
            logs={logs} 
            maxHeight="150px" 
            onClear={clearConsole}
          />
        </div>
      )}

      {/* Hidden iframe for code execution */}
      <iframe
        ref={iframeRef}
        title="code-execution-sandbox"
        style={{ display: 'none' }}
        sandbox="allow-scripts"
      ></iframe>
    </div>
  );
};

export default CodeSandbox;
