
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clipboard, Play, FileCode2 } from "lucide-react";
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRunCode?: () => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

export function CodeEditor({
  code,
  onCodeChange,
  onRunCode,
  language = "javascript",
  onLanguageChange,
}: CodeEditorProps) {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const container = document.getElementById('monaco-container');
    if (container && !editor) {
      const ed = monaco.editor.create(container, {
        value: code,
        language: language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        formatOnPaste: true,
        formatOnType: true,
      });

      ed.onDidChangeModelContent(() => {
        onCodeChange(ed.getValue());
      });

      setEditor(ed);
      return () => ed.dispose();
    }
  }, []);

  useEffect(() => {
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel()!, language);
    }
  }, [language]);

  const copyToClipboard = async () => {
    if (navigator.clipboard && editor) {
      await navigator.clipboard.writeText(editor.getValue());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLanguageChange = (value: string) => {
    if (onLanguageChange) {
      onLanguageChange(value);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden relative" id="monaco-container" />
      
      <div className="p-3 border-t border-[#333333] flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 bg-[#1E1E1E] border-[#333333]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              title="Copy code"
            >
              <Clipboard className="h-4 w-4 mr-1" />
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Format code"
              onClick={() => editor?.getAction('editor.action.formatDocument').run()}
            >
              <FileCode2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {onRunCode && (
          <Button
            variant="default"
            size="sm"
            onClick={onRunCode}
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        )}
      </div>
    </div>
  );
}
