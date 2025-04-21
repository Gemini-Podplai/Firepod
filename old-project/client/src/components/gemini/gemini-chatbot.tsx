import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Bot, User, Send, Loader2, Trash, ClipboardCopy, Settings, Zap, 
  Mic, Camera, Monitor, Upload, Youtube, FileIcon, Headphones,
  PlayCircle, PauseCircle, StopCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspace } from "@/context/workspace-context";

// Message type definition
type MessageType = "user" | "bot";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: number;
  isStreaming?: boolean;
}

// Define model options
const MODEL_OPTIONS = [
  { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" },
  { value: "gemini-1.0-pro-vision", label: "Gemini 1.0 Pro Vision" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
];

// Define model parameter presets
const MODEL_PRESETS = [
  { 
    name: "Balanced", 
    description: "Standard settings for general use",
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.95,
    model: "gemini-1.5-pro"
  },
  { 
    name: "Creative", 
    description: "High creativity for brainstorming and content generation",
    temperature: 0.9,
    maxTokens: 2048,
    topP: 0.98,
    model: "gemini-1.5-pro"
  },
  { 
    name: "Precise", 
    description: "Low temperature for more deterministic answers",
    temperature: 0.2,
    maxTokens: 1024,
    topP: 0.7,
    model: "gemini-1.5-pro"
  },
  { 
    name: "Code", 
    description: "Optimized for programming tasks",
    temperature: 0.3,
    maxTokens: 2048,
    topP: 0.8,
    model: "gemini-1.5-pro"
  },
  { 
    name: "Fast", 
    description: "Rapid responses with shorter context",
    temperature: 0.5,
    maxTokens: 512,
    topP: 0.9,
    model: "gemini-1.5-flash"
  },
  { 
    name: "Vision", 
    description: "For analyzing images and visual content",
    temperature: 0.6,
    maxTokens: 1024,
    topP: 0.95,
    model: "gemini-1.0-pro-vision"
  },
];

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export function GeminiChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: "Hello! I'm your Gemini AI assistant. How can I help you today?",
      type: "bot",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro");
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topP, setTopP] = useState(0.95);
  const [selectedPreset, setSelectedPreset] = useState("balanced");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addMessageToChat, selectedChat } = useWorkspace();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      type: "user",
      timestamp: Date.now(),
    };

    // Add user message to state
    setMessages((prev) => [...prev, userMessage]);
    
    // Save to workspace context if a chat is selected
    if (selectedChat) {
      addMessageToChat(selectedChat, {
        id: userMessage.id,
        content: userMessage.content,
        role: "user",
        timestamp: userMessage.timestamp,
      });
    }

    // Clear input
    setInputValue("");

    // Create a temporary "waiting" message
    const tempBotMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: tempBotMessageId,
        content: "",
        type: "bot",
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);
    setIsWaiting(true);

    try {
      // This would normally call the Firebase Extension endpoint
      // For now, we'll simulate a response with a delay

      // Compose a response based on user input
      let responseText = "";
      const content = inputValue.toLowerCase();

      if (content.includes("hello") || content.includes("hi")) {
        responseText = "Hello there! How can I assist you today?";
      } else if (content.includes("help")) {
        responseText = "I'm here to help! You can ask me questions, request information, or just chat. What would you like to know?";
      } else if (content.includes("feature") || content.includes("can you")) {
        responseText = `As a Gemini AI assistant, I can:
- Answer questions on a wide range of topics
- Help with creative writing and brainstorming
- Assist with code and programming problems
- Summarize information
- Generate content based on your prompts
- Have natural conversations about almost anything

What would you like me to help you with?`;
      } else if (content.includes("code") || content.includes("programming")) {
        responseText = `Here's a simple Python function that calculates the Fibonacci sequence:

\`\`\`python
def fibonacci(n):
    """Return the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Example usage
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")
\`\`\`

This is a recursive implementation. For large values of n, you might want to use a more efficient approach using memoization or an iterative solution.`;
      } else {
        responseText = `Thank you for your message! I'm currently running in demonstration mode without a direct connection to the Gemini API.

In a real implementation, your message would be processed by Google's Gemini API through a Firebase Extension, which would analyze your query and provide a relevant response.

The model you selected (${selectedModel}) would be used with a temperature setting of ${temperature}, which affects the creativity and randomness of the response.

Would you like to know more about how this integration works?`;
      }

      // Simulate streaming for a realistic effect
      let partialResponse = "";
      const words = responseText.split(" ");
      
      for (let i = 0; i < words.length; i++) {
        partialResponse += words[i] + " ";
        
        // Update message with partial content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempBotMessageId
              ? { ...msg, content: partialResponse.trim() }
              : msg
          )
        );
        
        // Add a random delay between words for realistic streaming
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 80 + 10));
      }

      // Update the temporary message with the full response and remove streaming flag
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? { ...msg, content: responseText, isStreaming: false }
            : msg
        )
      );
      
      // Save to workspace context if a chat is selected
      if (selectedChat) {
        addMessageToChat(selectedChat, {
          id: tempBotMessageId,
          content: responseText,
          role: "assistant",
          timestamp: Date.now(),
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Update the temporary message with an error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? {
                ...msg,
                content:
                  "I'm sorry, I encountered an error processing your request. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to get a response from Gemini API",
        variant: "destructive",
      });
    } finally {
      setIsWaiting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey && !isWaiting) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: generateId(),
        content: "Chat cleared. How can I help you today?",
        type: "bot",
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard",
    });
  };

  // Add new state variables for input mode and voice options
  const [inputMode, setInputMode] = useState<string>("text");
  const [voiceOption, setVoiceOption] = useState<string>("puck");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  
  // Voice options based on the screenshot
  const VOICE_OPTIONS = [
    { value: "puck", label: "Puck" },
    { value: "charon", label: "Charon" },
    { value: "kore", label: "Kore" },
    { value: "fennir", label: "Fennir" },
    { value: "aoede", label: "Aoede" },
    { value: "leda", label: "Leda" },
    { value: "orus", label: "Orus" },
    { value: "zephyr", label: "Zephyr" },
  ];
  
  // Simulate starting/stopping recording
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Your audio recording has been processed",
      });
      // Simulate a received message after recording
      if (inputMode === "mic") {
        setInputValue("This is a transcribed audio message");
        handleSendMessage();
      }
    } else {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: `${inputMode === "mic" ? "Audio" : "Video"} recording in progress...`,
      });
    }
  };

  // Simulate file upload
  const handleFileUpload = (type: string) => {
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Upload`,
      description: `Your ${type} file will be processed and analyzed.`,
    });
    if (type === "audio") {
      setInputValue("This is the content from the uploaded audio file");
    } else if (type === "image") {
      setInputValue("This is a description of the uploaded image");
    } else if (type === "video") {
      setInputValue("This is the content from the uploaded video file");
    } else if (type === "youtube") {
      setInputValue("This is the content from the YouTube video");
    }
  };
  
  // Toggle live mode
  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    if (!isLiveMode) {
      toast({
        title: "Live mode activated",
        description: `${inputMode === "mic" ? "Voice" : "Video"} streaming is now active.`,
      });
    } else {
      toast({
        title: "Live mode deactivated",
        description: `${inputMode === "mic" ? "Voice" : "Video"} streaming has stopped.`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full rounded-lg shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/gemini-icon.png" alt="Gemini" />
                <AvatarFallback className="bg-blue-100 text-blue-600">G</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Gemini Chat</CardTitle>
                <CardDescription className="text-xs">
                  {showSettings 
                    ? "Configure your chat settings"
                    : "Powered by Google's Gemini API"
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showSettings ? "Hide" : "Show"} settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearChat}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {showSettings && (
            <div className="mt-4 bg-muted/50 rounded-md p-3 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Model</p>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Temperature</p>
                    <span className="text-xs text-muted-foreground">
                      {temperature.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
              
              {/* Add voice selection to settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Voice</p>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Headphones className="h-3 w-3 mr-1" />
                      Output
                    </span>
                  </div>
                  <Select
                    value={voiceOption}
                    onValueChange={setVoiceOption}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Response Format</p>
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedModel.includes("vision") ? "default" : "outline"} 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedModel("gemini-1.0-pro-vision")}
                    >
                      <Camera className="h-3 w-3 mr-2" />
                      Vision
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Mic className="h-3 w-3 mr-2" />
                      Audio
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  <Zap className="inline h-3 w-3 mr-1" />
                  Using a higher temperature produces more creative and varied outputs.
                </p>
              </div>
            </div>
          )}
          
          <Separator className="mt-4" />
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto pt-4 pb-0">
          <div className="space-y-6 pb-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="h-8 w-8">
                      {message.type === "user" ? (
                        <>
                          <AvatarImage src="/user-icon.png" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            U
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/gemini-icon.png" />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            G
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </div>

                  <div
                    className={`mx-2 rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.isStreaming ? (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.content}
                          </ReactMarkdown>
                          <div className="mt-1 flex items-center text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Generating response...
                          </div>
                        </>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {!message.isStreaming && message.type === "bot" && (
                      <div className="mt-2 flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                <ClipboardCopy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-2 flex flex-col">
          {/* Input mode tabs */}
          <Tabs defaultValue="text" value={inputMode} onValueChange={setInputMode} className="w-full mb-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="text">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Text
                </span>
              </TabsTrigger>
              <TabsTrigger value="mic">
                <span className="flex items-center">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </span>
              </TabsTrigger>
              <TabsTrigger value="camera">
                <span className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </span>
              </TabsTrigger>
              <TabsTrigger value="screen">
                <span className="flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  Screen
                </span>
              </TabsTrigger>
            </TabsList>
            
            {/* Text input */}
            <TabsContent value="text" className="mt-2 space-y-2">
              <div className="flex w-full items-end gap-2">
                <div className="flex items-center space-x-2 mr-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleFileUpload("image")}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  placeholder="Type your message here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] flex-1 resize-none"
                  disabled={isWaiting}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isWaiting}
                  className="h-10 w-10 p-0"
                >
                  {isWaiting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* Voice input */}
            <TabsContent value="mic" className="mt-2 space-y-2">
              <div className="flex w-full items-center gap-2">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleFileUpload("audio")}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload audio file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={isLiveMode ? "default" : "outline"} 
                          size="icon" 
                          onClick={toggleLiveMode}
                        >
                          <Headphones className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle live voice chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className={`flex-1 ${isRecording ? "bg-red-50" : "bg-muted"} rounded-md p-3 text-center`}>
                  {isRecording ? (
                    <p className="text-sm text-red-600 flex items-center justify-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse mr-2"></span>
                      Recording audio...
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isLiveMode ? "Live mode active. Speak to chat with Gemini." : "Press record to start speaking"}
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="h-10 w-10 p-0"
                >
                  {isRecording ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* Camera input */}
            <TabsContent value="camera" className="mt-2 space-y-2">
              <div className="flex w-full items-center gap-2">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleFileUpload("image")}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload image</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleFileUpload("video")}>
                          <Youtube className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload video</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className={`flex-1 ${isRecording ? "bg-red-50" : "bg-muted"} rounded-md p-3 text-center h-16 flex items-center justify-center`}>
                  {isRecording ? (
                    <p className="text-sm text-red-600 flex items-center justify-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse mr-2"></span>
                      Camera active - Streaming video...
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Press camera button to show Gemini what you're looking at
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="h-10 w-10 p-0"
                >
                  {isRecording ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* Screen share input */}
            <TabsContent value="screen" className="mt-2 space-y-2">
              <div className="flex w-full items-center gap-2">
                <div className={`flex-1 ${isRecording ? "bg-red-50" : "bg-muted"} rounded-md p-3 text-center h-16 flex items-center justify-center`}>
                  {isRecording ? (
                    <p className="text-sm text-red-600 flex items-center justify-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse mr-2"></span>
                      Sharing your screen with Gemini...
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Share your screen to show Gemini what you're working on
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="h-10 w-10 p-0"
                >
                  {isRecording ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardFooter>
      </Card>
    </div>
  );
}