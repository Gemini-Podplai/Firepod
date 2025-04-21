import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';

interface CodeFile {
  name: string;
  content: string;
  language: string;
}

export default function CodePage() {
  const [files, setFiles] = useState<CodeFile[]>([
    { name: 'main.js', content: '// Write your code here', language: 'javascript' }
  ]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [newFileName, setNewFileName] = useState('');
  
  // Get the current file
  const currentFile = files[currentFileIndex];
  
  // Update code state based on the current file
  const [code, setCode] = useState(currentFile.content);
  const [language, setLanguage] = useState(currentFile.language);
  
  // Update files array when code changes
  useEffect(() => {
    const updatedFiles = [...files];
    updatedFiles[currentFileIndex] = {
      ...updatedFiles[currentFileIndex],
      content: code,
      language: language
    };
    setFiles(updatedFiles);
  }, [code, language]);
  
  // Update code and language when switching files
  useEffect(() => {
    setCode(currentFile.content);
    setLanguage(currentFile.language);
  }, [currentFileIndex]);
  
  // Highlight code with Prism
  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);
  
  // Function to add a new file
  const handleAddFile = () => {
    if (!newFileName) return;
    
    // Determine file extension and language
    const extension = newFileName.split('.').pop() || 'js';
    let fileLanguage = 'javascript';
    
    switch (extension) {
      case 'ts': fileLanguage = 'typescript'; break;
      case 'py': fileLanguage = 'python'; break;
      case 'jsx': fileLanguage = 'jsx'; break;
      case 'tsx': fileLanguage = 'tsx'; break;
      default: fileLanguage = 'javascript';
    }
    
    const newFile = {
      name: newFileName,
      content: `// ${newFileName}`,
      language: fileLanguage
    };
    
    setFiles([...files, newFile]);
    setCurrentFileIndex(files.length);
    setNewFileName('');
  };
  
  // Function to delete the current file
  const handleDeleteFile = () => {
    if (files.length <= 1) return; // Don't delete the last file
    
    const updatedFiles = files.filter((_, index) => index !== currentFileIndex);
    setFiles(updatedFiles);
    setCurrentFileIndex(Math.max(0, currentFileIndex - 1));
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Code Editor</h1>
      
      <div className="flex items-center mb-4 space-x-2">
        <div className="flex-1 overflow-x-auto whitespace-nowrap">
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => setCurrentFileIndex(index)}
              className={`px-3 py-1 mr-1 border rounded-t ${
                index === currentFileIndex 
                  ? 'bg-white border-b-white' 
                  : 'bg-gray-100'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="new-file.js"
            className="p-1 border rounded text-sm w-32"
          />
          <button
            onClick={handleAddFile}
            className="px-2 py-1 bg-green-500 text-white rounded text-sm"
            aria-label="Add file"
          >
            Add
          </button>
          <button
            onClick={handleDeleteFile}
            className="px-2 py-1 bg-red-500 text-white rounded text-sm"
            disabled={files.length <= 1}
            aria-label="Delete current file"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="jsx">JSX</option>
          <option value="tsx">TSX</option>
        </select>
      </div>
      
      <div className="border rounded p-4 bg-gray-50">
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full min-h-[300px] font-mono p-4 bg-transparent absolute top-0 left-0 z-10 text-transparent caret-black resize-none"
            spellCheck="false"
          />
          <pre className="w-full min-h-[300px] font-mono p-4 overflow-auto pointer-events-none">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}