import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Editor, loader } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

// Configure the Monaco Editor loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
  }
});

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  height?: string | number;
  width?: string | number;
  readOnly?: boolean;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function MonacoEditor({
  value,
  onChange,
  language = 'javascript',
  height = '500px',
  width = '100%',
  readOnly = false,
  options = {}
}: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { theme } = useTheme();
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Set up Monaco Editor
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.updateOptions({ readOnly });
    setIsEditorReady(true);
  };

  // Update theme when system/app theme changes
  useEffect(() => {
    if (isEditorReady) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme, isEditorReady]);

  // Default editor options
  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
    lineNumbers: 'on',
    wordWrap: 'on',
    renderLineHighlight: 'all',
    contextmenu: true,
    ...options,
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Editor
        height={height}
        width={width}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={defaultOptions}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        loading={
          <div className="flex items-center justify-center h-full">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}

// Export language options for usage in other components
export const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell/Bash' },
  { value: 'plaintext', label: 'Plain Text' },
];
