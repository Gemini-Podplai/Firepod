import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatMessage } from "@/components/common/chat-message";
import { ChatInput } from "@/components/common/chat-input";
import { CodeEditor } from "@/components/common/code-editor";
import { ParametersPanel } from "@/components/common/parameters-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Eraser, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AIModel, 
  AIModelParameters, 
  ChatMessage as ChatMessageType,
  DEFAULT_MODEL,
  DEFAULT_PARAMETERS,
  sendChatMessage
} from "@/lib/openai";
import { sendChatMessageGeminiStream } from "@/lib/googleai";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/context/workspace-context";
import { nanoid } from "nanoid";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { user } = useAuth();
  const { selectedChat, chats, addMessageToChat, clearChat } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [model, setModel] = useState<AIModel>(DEFAULT_MODEL);
  const [parameters, setParameters] = useState<AIModelParameters>(DEFAULT_PARAMETERS);
  const [activeTab, setActiveTab] = useState("code-editor");
  const [code, setCode] = useState<string>("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Initialize with a system message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: nanoid(),
        role: "system",
        content: "I'm your AI assistant. I can help you with coding, answering questions, and more. How can I assist you today?",
        timestamp: Date.now()
      }]);
    }
  }, [messages.length]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Set messages from selected chat
  useEffect(() => {
    if (selectedChat) {
      console.log("Loading messages for chat ID:", selectedChat);
      const chat = chats.find(c => c.id === selectedChat);
      
      if (chat) {
        console.log("Found chat:", chat.title, "with", chat.messages.length, "messages");
        
        // Always ensure we have a system message at the beginning
        const systemMessage = {
          id: nanoid(),
          role: "system" as const,
          content: "I'm your AI assistant. I can help you with coding, answering questions, and more. How can I assist you today?",
          timestamp: Date.now()
        };
        
        // Only add system message if there isn't already one
        const hasSystemMessage = chat.messages.some(m => m.role === "system");
        
        if (hasSystemMessage) {
          setMessages(chat.messages);
        } else {
          setMessages([systemMessage, ...chat.messages]);
        }
      } else {
        console.warn("Selected chat not found in chats list:", chats);
        // Set default welcome message if selected chat not found
        setMessages([{
          id: nanoid(),
          role: "system",
          content: "I'm your AI assistant. I can help you with coding, answering questions, and more. How can I assist you today?",
          timestamp: Date.now()
        }]);
      }
    }
  }, [selectedChat, chats]);

  // Load saved preferences
  useEffect(() => {
    const savedModel = localStorage.getItem("defaultModel");
    const savedParameters = localStorage.getItem("defaultParameters");
    const savedStreamingPref = localStorage.getItem("useStreaming");
    
    if (savedModel) {
      try {
        setModel(JSON.parse(savedModel));
      } catch (e) {
        console.error("Failed to parse saved model:", e);
      }
    }
    
    if (savedParameters) {
      try {
        setParameters(JSON.parse(savedParameters));
      } catch (e) {
        console.error("Failed to parse saved parameters:", e);
      }
    }
    
    if (savedStreamingPref) {
      try {
        setUseStreaming(JSON.parse(savedStreamingPref));
      } catch (e) {
        console.error("Failed to parse streaming preference:", e);
      }
    }
  }, []);
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isWaitingForResponse) return;
    
    const userMessage: ChatMessageType = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: Date.now()
    };
    
    // Update local state
    setMessages(prev => [...prev, userMessage]);
    
    // Update workspace context
    if (selectedChat) {
      addMessageToChat(selectedChat, userMessage);
    }
    
    // Set waiting state
    setIsWaitingForResponse(true);
    
    try {
      const messageId = nanoid();
      
      if (model.provider.toLowerCase() === "google" && useStreaming) {
        // Use streaming for Google models
        // Add initial empty message for streaming
        setStreamingMessageId(messageId);
        
        const assistantMessage: ChatMessageType = {
          id: messageId,
          role: "assistant",
          content: "",
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Get API key from environment
        // Hardcoding the API key as a fallback in development only - this would be removed in production
        // and proper environment variables would be used instead
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyBhZ7Dst3Xd2xRoPzZnY8dkqoXTSpx-5R8";
        
        console.log("Checking API key:", apiKey ? "Key exists" : "Key missing", "Using model:", model.id);
        
        // Stream response
        await sendChatMessageGeminiStream(
          model.id,
          [...messages.filter(m => m.role !== "system"), userMessage],
          apiKey,
          parameters,
          (chunk) => {
            // Update the message content with each chunk
            setMessages(prev => 
              prev.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: msg.content + chunk } 
                  : msg
              )
            );
          },
          (error) => {
            console.error("Streaming error:", error);
            toast({
              title: "Error",
              description: `Streaming error: ${error.message}`,
              variant: "destructive"
            });
          },
          (fullResponse) => {
            // When complete, ensure the message is saved to the workspace
            const finalMessage: ChatMessageType = {
              id: messageId,
              role: "assistant",
              content: fullResponse,
              timestamp: Date.now()
            };
            
            if (selectedChat) {
              addMessageToChat(selectedChat, finalMessage);
            }
            
            // Check for code in the response
            const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
            const codeMatch = fullResponse.match(codeBlockRegex);
            if (codeMatch) {
              setCode(codeMatch[2]);
              if (codeMatch[1]) {
                setCodeLanguage(codeMatch[1]);
              }
            }
          }
        );
        
        setStreamingMessageId(null);
      } else {
        // Non-streaming approach for other models or when streaming is disabled
        // Add loading message temporarily
        setMessages(prev => [
          ...prev, 
          { 
            id: messageId, 
            role: "assistant", 
            content: "Thinking...", 
            timestamp: Date.now() 
          }
        ]);
        
        // Send to API
        const aiResponse = await sendChatMessage(
          model,
          [...messages.filter(m => m.role !== "system"), userMessage],
          parameters
        );
        
        // Remove loading message
        setMessages(prev => prev.filter(m => m.id !== messageId));
        
        // Add real response
        const assistantMessage: ChatMessageType = {
          id: nanoid(),
          role: "assistant",
          content: aiResponse.message || "I'm not sure how to respond to that.",
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update workspace context
        if (selectedChat) {
          addMessageToChat(selectedChat, assistantMessage);
        }
        
        // If response contains code, update the code editor
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
        const codeMatch = assistantMessage.content.match(codeBlockRegex);
        if (codeMatch) {
          setCode(codeMatch[2]);
          if (codeMatch[1]) {
            setCodeLanguage(codeMatch[1]);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      // Remove streaming message on error
      if (streamingMessageId) {
        setMessages(prev => prev.filter(m => m.id !== streamingMessageId));
        setStreamingMessageId(null);
      }
    } finally {
      setIsWaitingForResponse(false);
    }
  };
  
  const handleClearChat = () => {
    if (selectedChat) {
      clearChat(selectedChat);
      setMessages([{
        id: nanoid(),
        role: "system",
        content: "I'm your AI assistant. I can help you with coding, answering questions, and more. How can I assist you today?",
        timestamp: Date.now()
      }]);
    }
  };
  
  const handleExportChat = () => {
    // Export chat as JSON
    const chatData = {
      id: selectedChat,
      messages: messages.filter(m => m.role !== "system"),
      model: model,
      timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleRunCode = () => {
    toast({
      title: "Code Execution",
      description: "Code execution is not available in the prototype version",
    });
  };
  
  const toggleStreaming = () => {
    const newValue = !useStreaming;
    setUseStreaming(newValue);
    localStorage.setItem("useStreaming", JSON.stringify(newValue));
    
    toast({
      title: newValue ? "Streaming Enabled" : "Streaming Disabled",
      description: newValue 
        ? "Responses will now appear in real-time as they're generated" 
        : "Responses will appear only when complete"
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header selectedModel={model} onSelectModel={setModel} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="flex flex-col h-full">
                <div className="border-b border-[#333333] p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">AI Chat</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="streaming-mode" 
                          checked={useStreaming}
                          onCheckedChange={toggleStreaming}
                        />
                        <Label htmlFor="streaming-mode" className="text-sm">
                          Streaming
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleClearChat}
                          title="Clear chat"
                        >
                          <Eraser className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleExportChat}
                          title="Export conversation"
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                      userName={user?.name || "User"}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  isWaiting={isWaitingForResponse}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={50} minSize={30}>
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <TabsList className="mx-4 mt-4 mb-0">
                  <TabsTrigger value="code-editor">Code Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code-editor" className="flex-1 p-0 m-0">
                  <CodeEditor
                    code={code}
                    onCodeChange={setCode}
                    onRunCode={handleRunCode}
                    language={codeLanguage}
                    onLanguageChange={setCodeLanguage}
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="flex-1 p-4 m-0 overflow-auto">
                  <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-4 mb-4">
                    <h3 className="text-sm font-medium mb-2">Preview Output</h3>
                    <p className="text-muted-foreground text-sm">Run the code to see the results</p>
                  </div>
                  
                  <div className="bg-[#1E1E1E] rounded-lg border border-[#333333]">
                    <div className="border-b border-[#333333] p-3 flex justify-between items-center">
                      <span className="text-sm font-medium">Console Output</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="p-3 font-mono text-xs overflow-x-auto">
                      <p className="text-green-500">Ready to execute code...</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="parameters" className="flex-1 p-0 m-0">
                  <ParametersPanel
                    parameters={parameters}
                    onUpdateParameters={setParameters}
                  />
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
