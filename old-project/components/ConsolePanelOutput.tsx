import React, { useEffect, useRef } from 'react';

interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}

interface ConsolePanelOutputProps {
  logs: LogEntry[];
  maxHeight?: string;
  onClear?: () => void;
}

export const ConsolePanelOutput: React.FC<ConsolePanelOutputProps> = ({ 
  logs, 
  maxHeight = '200px',
  onClear 
}) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-white';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-gray-900 text-white p-3 rounded-md w-full border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Console Output</h3>
        {onClear && (
          <button 
            onClick={onClear} 
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Clear
          </button>
        )}
      </div>
      <div 
        className="font-mono text-sm overflow-y-auto"
        style={{ maxHeight }}
      >
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className={`${getLogStyle(log.type)} mb-1`}>
              <span className="text-gray-400 text-xs mr-2">[{formatTimestamp(log.timestamp)}]</span>
              <span className="whitespace-pre-wrap">{log.content}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">No console output</div>
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};
