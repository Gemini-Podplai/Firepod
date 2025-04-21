import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, Play, Save, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { AIModel, AIModelParameters, DEFAULT_MODEL, DEFAULT_PARAMETERS } from '@/lib/openai';

interface SandboxResult {
  success: boolean;
  output: string;
  executionTime?: string;
  memoryUsage?: string;
  error?: string;
}

export default function CodePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [model, setModel] = useState<AIModel>(DEFAULT_MODEL);
  const [parameters, setParameters] = useState<AIModelParameters>(DEFAULT_PARAMETERS);
  const [code, setCode] = useState<string>(`// Write your code here\nconsole.log("Hello, world!");`);
  const [language, setLanguage] = useState<string>('javascript');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [result, setResult] = useState<SandboxResult | null>(null);

  // Available programming languages
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' }
  ];

  // Generate code using AI
  const generateCode = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt to generate code",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const updatedParams = {
        ...parameters,
        systemPrompt: `You are an expert ${language} programmer. Generate working, well-structured code that follows best practices.`
      };
      
      const response = await apiRequest("POST", "/api/ai/generate-code", {
        model: model.id,
        prompt,
        language,
        parameters: updatedParams
      });

      const data = await response.json();
      if (data.code) {
        setCode(data.code);
        toast({
          title: "Code generated",
          description: "AI has generated code based on your prompt"
        });
      }
    } catch (error) {
      console.error("Failed to generate code:", error);
      toast({
        title: "Failed to generate code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Execute code in sandbox
  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Code is required",
        description: "Please enter code to execute",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setResult(null);
    
    try {
      const response = await apiRequest("POST", "/api/sandbox/execute", {
        code,
        language
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast({
          title: "Code executed successfully",
          description: `Execution time: ${data.executionTime || 'N/A'}`
        });
      } else {
        toast({
          title: "Code execution failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to execute code:", error);
      setResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "An unknown error occurred"
      });
      
      toast({
        title: "Failed to execute code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Save code to project (placeholder for future implementation)
  const saveCode = () => {
    toast({
      title: "Code saved",
      description: "Your code has been saved successfully"
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header selectedModel={model} onSelectModel={setModel} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          <h1 className="text-2xl font-bold mb-6">Code Editor</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto">
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Editor</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  Write and edit your code here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono min-h-[400px] resize-y"
                  spellCheck={false}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={saveCode}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button onClick={executeCode} disabled={isExecuting}>
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Code
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    Results of your code execution will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-4">
                      {result.success ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Success
                            </Badge>
                            {result.executionTime && (
                              <Badge variant="outline">
                                Time: {result.executionTime}
                              </Badge>
                            )}
                            {result.memoryUsage && (
                              <Badge variant="outline">
                                Memory: {result.memoryUsage}
                              </Badge>
                            )}
                          </div>
                          <div className="bg-muted rounded-md p-4 font-mono whitespace-pre-wrap text-sm">
                            {result.output}
                          </div>
                        </div>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {result.error || "An unknown error occurred during execution"}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No output to display. Run your code to see results.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Code Generator</CardTitle>
                  <CardDescription>
                    Describe what code you want to generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a function that calculates the Fibonacci sequence"
                    className="min-h-[120px]"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generateCode} 
                    disabled={isGenerating || !prompt.trim()} 
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Code"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}