import { editor } from 'monaco-editor';

export interface SyntaxError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function highlightSyntaxErrors(
  editorInstance: editor.IStandaloneCodeEditor,
  code: string,
  language: string
): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const model = editorInstance.getModel();
  
  if (!model) return errors;

  // Clear previous markers
  editor.setModelMarkers(model, 'syntax', []);

  try {
    // For JavaScript/TypeScript, try to parse the code
    if (language === 'javascript' || language === 'typescript') {
      // Try to evaluate the code to find syntax errors
      // Note: This is simplified - in a real app, you'd want to use a proper parser
      new Function(code);
    }
  } catch (e) {
    if (e instanceof Error) {
      // Parse the error message to extract line and column information
      const errorInfo = parseErrorMessage(e.message, code);
      
      if (errorInfo) {
        errors.push({
          line: errorInfo.line,
          column: errorInfo.column,
          message: errorInfo.message,
          severity: 'error'
        });
        
        // Add markers to editor
        editor.setModelMarkers(model, 'syntax', [{
          startLineNumber: errorInfo.line,
          startColumn: errorInfo.column,
          endLineNumber: errorInfo.line,
          endColumn: errorInfo.column + 1,
          message: errorInfo.message,
          severity: monaco.MarkerSeverity.Error
        }]);
      }
    }
  }

  return errors;
}

function parseErrorMessage(errorMsg: string, code: string): { line: number, column: number, message: string } | null {
  // Default values if we can't extract line/column
  let line = 1;
  let column = 1;
  let message = errorMsg;

  // Try to extract line and column from error message
  // Different browsers format error messages differently
  const lineMatch = errorMsg.match(/line (\d+)/i);
  const colMatch = errorMsg.match(/column (\d+)/i);
  
  if (lineMatch) {
    line = parseInt(lineMatch[1], 10);
  }
  
  if (colMatch) {
    column = parseInt(colMatch[1], 10);
  }

  return { line, column, message };
}
