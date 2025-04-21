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
  PlayCircle, PauseCircle, StopCircle, Globe, Terminal, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWorkspace } from "@/context/workspace-context";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ModelSettingsDialog, { ModelSettings } from "./model-settings";
import { aiService, defaultModelSettings } from "@/lib/ai-service";

// Message type definition
type MessageType = "user" | "bot";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: number;
  isStreaming?: boolean;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Define voice options based on the original component
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

export function EnhancedGeminiChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: "Hello! I'm your Gemini AI assistant with enhanced capabilities. How can I help you today?",
      type: "bot",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modelSettings, setModelSettings] = useState<ModelSettings>(defaultModelSettings);
  const [progress, setProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState("balanced");
  const [chatSession, setChatSession] = useState<any>(null);
  
  // Add new state variables for input mode and voice options
  const [inputMode, setInputMode] = useState<string>("text");
  const [voiceOption, setVoiceOption] = useState<string>("puck");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [capturedMedia, setCapturedMedia] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addMessageToChat, selectedChat } = useWorkspace();

  // Initialize chat session on component mount or when model settings change
  useEffect(() => {
    try {
      // Update the model settings in the service
      aiService.updateSettings(modelSettings);
      
      // Start a new chat session
      const session = aiService.startChat();
      setChatSession(session);
      
      console.log(`Chat session initialized with model: ${modelSettings.model}`);
    } catch (error) {
      console.error("Error initializing chat session:", error);
      toast({
        title: "Error",
        description: `Failed to initialize chat session: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [modelSettings]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle model settings change
  const handleModelSettingsChange = (newSettings: ModelSettings) => {
    setModelSettings(newSettings);
    
    toast({
      title: "Settings Updated",
      description: `Model settings have been updated to "${newSettings.chatPersona}" profile`,
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !capturedMedia) return;
    if (!chatSession) {
      toast({
        title: "Chat not ready",
        description: "Please wait while the AI model initializes",
        variant: "destructive",
      });
      return;
    }

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
    setCapturedMedia(null);
    setInputMode("text");

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
    setProgress(0);
    let fullResponseText = "";

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 300);
      
      let responseText = "";
      
      // Handle based on whether we have media
      if (capturedMedia && modelSettings.model.includes("vision")) {
        // Using a vision model with media
        try {
          const mediaData = {
            mimeType: capturedMedia.type,
            data: capturedMedia.data.split(",")[1] // Remove the data URL prefix
          };
          
          const response = await aiService.processMedia(mediaData, inputValue);
          responseText = response.text();
        } catch (error) {
          console.error("Error processing media:", error);
          throw error;
        }
      } else {
        // Text-only generation using chat
        try {
          const response = await aiService.sendMessage(
            chatSession,
            inputValue,
            {
              onStart: () => {
                console.log("Starting streaming response...");
              },
              onToken: (token) => {
                fullResponseText += token;
                
                // Update message in real-time
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const aiMessage = newMessages.find(m => m.id === tempBotMessageId);
                  
                  if (aiMessage) {
                    aiMessage.content = fullResponseText;
                  }
                  
                  return newMessages;
                });
              },
              onComplete: () => {
                console.log("Streaming response complete");
              }
            }
          );
          
          // In case onToken doesn't capture everything, use the full response
          if (response.text) {
            responseText = response.text();
          } else {
            responseText = fullResponseText;
          }
        } catch (error) {
          console.error("Error sending message:", error);
          throw error;
        }
      }
      
      // Clear interval and update progress
      clearInterval(progressInterval);
      setProgress(100);
      
      // Update the temporary message with the full response and remove streaming flag
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? { ...msg, content: responseText || fullResponseText, isStreaming: false }
            : msg
        )
      );
      
      // Save to workspace context if a chat is selected
      if (selectedChat) {
        addMessageToChat(selectedChat, {
          id: tempBotMessageId,
          content: responseText || fullResponseText,
          role: "assistant",
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Update the temporary message with an error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? {
                ...msg,
                content:
                  `Error: ${error.message}. Please try again with a different prompt or model setting.`,
                isStreaming: false,
              }
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: `Failed to get a response: ${error.message}`,
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
  
  // Camera capture
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setCapturedMedia({
            type: file.type,
            url: URL.createObjectURL(file),
            data: dataUrl
          });
          setInputMode("camera");
          
          toast({
            title: "Image captured",
            description: "Image has been attached to your message."
          });
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  // Screen capture
  const handleScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      
      const imageCapture = new ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      
      const context = canvas.getContext('2d');
      context?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      setCapturedMedia({
        type: 'image/jpeg',
        url: dataUrl,
        data: dataUrl
      });
      
      setInputMode("screen");
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Screenshot captured",
        description: "Screenshot has been attached to your message."
      });
    } catch (error) {
      console.error('Error capturing screen:', error);
      toast({
        title: "Screen capture failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Simulate voice recording toggle
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
  
  // Simulate toggling live mode
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

  const clearMedia = () => {
    setCapturedMedia(null);
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
              <ModelSettingsDialog 
                currentSettings={modelSettings}
                onSettingsChange={handleModelSettingsChange}
                availableModels={[
                  "gemini-pro",
                  "gemini-1.5-pro", 
                  "gemini-1.5-flash", 
                  "gemini-1.0-pro", 
                  "gemini-1.0-pro-vision"
                ]}
              />
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={modelSettings.enableWebSearch ? "default" : "outline"} className="gap-1">
                  <Globe className="h-3 w-3" /> Web Search
                </Badge>
                <Badge variant={modelSettings.enableCodeExecution ? "default" : "outline"} className="gap-1">
                  <Terminal className="h-3 w-3" /> Code Execution
                </Badge>
                <Badge variant={modelSettings.enableCodeInterpreter ? "default" : "outline"} className="gap-1">
                  <Zap className="h-3 w-3" /> Code Interpreter
                </Badge>
                <Badge variant={modelSettings.enableToolUse ? "default" : "outline"} className="gap-1">
                  <Sparkles className="h-3 w-3" /> Function Calling
                </Badge>
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Voice</p>
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
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {message.type === "user" ? (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground ml-2">
                    <User className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted text-muted-foreground mr-2">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {capturedMedia && message.type === "user" && (
                    <div className="mb-2">
                      <img 
                        src={capturedMedia.url} 
                        alt="Captured media"
                        className="rounded-md max-h-64 w-auto"
                      />
                    </div>
                  )}
                  
                  <ReactMarkdown 
                    className="text-sm prose prose-sm dark:prose-invert" 
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                  
                  {message.isStreaming && (
                    <div className="mt-2">
                      <div className="animate-pulse h-4 w-12 bg-current opacity-30 rounded"></div>
                    </div>
                  )}
                  
                  {!message.isStreaming && message.type === "bot" && (
                    <div className="flex justify-end mt-2 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isWaiting && progress < 100 && (
            <div className="max-w-[85%] mr-auto">
              <Progress value={progress} className="w-full max-w-[200px] h-2" />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="flex flex-col p-4 gap-3">
          {/* Input mode tabs */}
          <Tabs value={inputMode} onValueChange={setInputMode} className="w-full">
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="mic">Voice</TabsTrigger>
              <TabsTrigger 
                value="camera" 
                onClick={handleCameraCapture}
                disabled={!modelSettings.model.includes("vision")}
              >
                Camera
              </TabsTrigger>
              <TabsTrigger 
                value="screen" 
                onClick={handleScreenCapture}
                disabled={!modelSettings.model.includes("vision")}
              >
                Screen
              </TabsTrigger>
            </TabsList>
            
            {/* Content for different input modes */}
            <TabsContent value="text" className="m-0">
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder={modelSettings.enableWebSearch 
                    ? "Ask anything (with web search)..." 
                    : "Ask anything..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] flex-1"
                  disabled={isWaiting}
                />
                <Button
                  size="icon"
                  className="h-[60px]"
                  disabled={isWaiting || !inputValue.trim()}
                  onClick={handleSendMessage}
                >
                  {isWaiting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileUpload("image")}
                  disabled={isWaiting}
                >
                  <Upload className="h-3 w-3 mr-1" /> Upload Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileUpload("audio")}
                  disabled={isWaiting}
                >
                  <FileIcon className="h-3 w-3 mr-1" /> Upload File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileUpload("youtube")}
                  disabled={isWaiting}
                >
                  <Youtube className="h-3 w-3 mr-1" /> YouTube URL
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="mic" className="m-0">
              <div className="flex flex-col items-center justify-center p-4 gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className="h-14 w-14 rounded-full"
                    onClick={toggleRecording}
                    disabled={isWaiting}
                  >
                    {isRecording ? (
                      <StopCircle className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>
                  <div className="text-sm">
                    {isRecording ? (
                      <span className="text-destructive">Recording... Click to stop</span>
                    ) : (
                      <span>Click to start recording</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant={isLiveMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleLiveMode}
                    disabled={isWaiting}
                  >
                    {isLiveMode ? (
                      <>
                        <PauseCircle className="h-3 w-3 mr-1" /> Stop Live Mode
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3 w-3 mr-1" /> Start Live Mode
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileUpload("audio")}
                    disabled={isWaiting}
                  >
                    <Upload className="h-3 w-3 mr-1" /> Upload Audio
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="m-0">
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Ask about the image..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] flex-1"
                  disabled={isWaiting}
                />
                <Button
                  size="icon"
                  className="h-[60px]"
                  disabled={isWaiting || (!inputValue.trim() && !capturedMedia)}
                  onClick={handleSendMessage}
                >
                  {isWaiting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {capturedMedia && (
                <div className="mt-2 relative inline-block">
                  <img 
                    src={capturedMedia.url} 
                    alt="Captured media"
                    className="h-20 w-auto rounded-md border"
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={clearMedia}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="screen" className="m-0">
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Ask about the screenshot..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] flex-1"
                  disabled={isWaiting}
                />
                <Button
                  size="icon"
                  className="h-[60px]"
                  disabled={isWaiting || (!inputValue.trim() && !capturedMedia)}
                  onClick={handleSendMessage}
                >
                  {isWaiting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {capturedMedia && (
                <div className="mt-2 relative inline-block">
                  <img 
                    src={capturedMedia.url} 
                    alt="Captured media"
                    className="h-20 w-auto rounded-md border"
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={clearMedia}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Active model display */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Model: {modelSettings.model}
              </Badge>
              {modelSettings.enableWebSearch && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Globe className="h-3 w-3" /> Web Search
                </Badge>
              )}
              {modelSettings.enableCodeExecution && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Terminal className="h-3 w-3" /> Code Run
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {modelSettings.chatPersona.charAt(0).toUpperCase() + modelSettings.chatPersona.slice(1)} | Temp: {modelSettings.temperature.toFixed(1)}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}