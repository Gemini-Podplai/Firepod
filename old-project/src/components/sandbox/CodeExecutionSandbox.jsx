import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './CodeExecutionSandbox.css';

const CodeExecutionSandbox = forwardRef(({ code = '' }, ref) => {
  const [output, setOutput] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const outputRef = useRef(null);
  
  // Expose the executeCode method to parent components
  useImperativeHandle(ref, () => ({
    executeCode: (codeToExecute) => executeCode(codeToExecute)
  }));
  
  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);
  
  // Execute code initially if provided via props
  useEffect(() => {
    if (code) {
      executeCode(code);
    }
  }, [code]);
  
  // Method to execute the code safely within an iframe
  const executeCode = (codeToExecute) => {
    if (!codeToExecute) return;
    
    setIsExecuting(true);
    setError(null);
    setOutput([]);
    
    try {
      // Create or reset the iframe
      if (iframeRef.current) {
        iframeRef.current.remove();
      }
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframeRef.current = iframe;
      
      // Set up console.log interception
      const scriptContent = `
        <script>
          // Capture console.log and other methods
          const originalConsole = console;
          const logTypes = ['log', 'error', 'warn', 'info'];
          
          logTypes.forEach(type => {
            console[type] = function() {
              // Convert arguments to a proper array
              const args = Array.from(arguments).map(arg => {
                try {
                  // Handle objects, arrays, and other complex types
                  if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                  }
                  return String(arg);
                } catch (e) {
                  return '[Complex object]';
                }
              });
              
              // Send message to parent window
              window.parent.postMessage({
                type: 'console',
                method: type,
                args: args,
                timestamp: new Date().toISOString()
              }, '*');
              
              // Still call the original method
              originalConsole[type].apply(originalConsole, arguments);
            };
          });
          
          // Capture uncaught errors
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'error',
              message: message,
              source: source,
              lineno: lineno,
              colno: colno,
              stack: error && error.stack ? error.stack : null,
              timestamp: new Date().toISOString()
            }, '*');
            return true; // Prevents default error handling
          };
          
          // Execute the code after a small delay to ensure everything is set up
          setTimeout(() => {
            try {
              ${wrapCodeInAsyncFunction(codeToExecute)}
            } catch(e) {
              console.error(e.message);
            }
          }, 10);
        </script>
      `;
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(scriptContent);
      iframe.contentDocument.close();
      
      // Listen for messages from the iframe
      const messageHandler = (event) => {
        const { data } = event;
        
        if (data && (data.type === 'console' || data.type === 'error')) {
          if (data.type === 'console') {
            setOutput(prev => [...prev, {
              type: data.method || 'log',
              content: data.args.join(' '),
              timestamp: data.timestamp
            }]);
          } else if (data.type === 'error') {
            setError({
              message: data.message,
              line: data.lineno,
              column: data.colno,
              stack: data.stack
            });
            setOutput(prev => [...prev, {
              type: 'error',
              content: `Error: ${data.message} (line:${data.lineno}, col:${data.colno})`,
              timestamp: data.timestamp
            }]);
          }
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Cleanup after execution timeout or completion
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        setIsExecuting(false);
      }, 5000); // 5-second timeout for long-running operations
      
    } catch (err) {
      console.error("Error setting up sandbox:", err);
      setError({ message: err.message });
      setOutput(prev => [...prev, {
        type: 'error',
        content: `Error setting up sandbox: ${err.message}`,
        timestamp: new Date().toISOString()
      }]);
      setIsExecuting(false);
    }
  };
  
  // Helper to wrap the code in an async function for top-level await support
  const wrapCodeInAsyncFunction = (code) => {
    return `
      (async function() {
        try {
          ${code}
        } catch (e) {
          console.error(e);
        }
      })();
    `;
  };
  
  return (
    <div className="sandbox-container">
      <div className="sandbox-header">
        <h3>Console Output</h3>
        {isExecuting && <span className="executing-indicator">Running...</span>}
        <button 
          className="clear-button"
          onClick={() => setOutput([])}
        >
          Clear
        </button>
      </div>
      <div className="output-container" ref={outputRef}>
        {output.length === 0 ? (
          <div className="empty-output">No output yet. Run your code to see results here.</div>
        ) : (
          output.map((item, index) => (
            <div 
              key={index} 
              className={`output-line output-${item.type}`}
            >
              <span className="output-content">{item.content}</span>
            </div>
          ))
        )}
      </div>
      
      {/* Hidden iframe will be inserted here programmatically */}
    </div>
  );
});

CodeExecutionSandbox.displayName = 'CodeExecutionSandbox';

export default CodeExecutionSandbox;
