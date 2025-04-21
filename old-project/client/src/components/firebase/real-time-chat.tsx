import { useState, useEffect, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref as dbRef, push, onValue, off, update, get, query, orderByChild, limitToLast } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import AudioRecorder from "./audio-recorder";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  senderName: string;
  timestamp: number;
  type?: "text" | "audio";
  audioUrl?: string;
}

interface RealTimeChatProps {
  chatId: string;
  onSendMessage?: (message: string) => Promise<string | null>;
}

export default function RealTimeChat({ chatId, onSendMessage }: RealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages and set up real-time listener
  useEffect(() => {
    if (!chatId) return;
    
    const messagesRef = dbRef(database, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));
    
    // Listen for new messages
    onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        
        // Sort messages by timestamp
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      off(messagesRef);
    };
  }, [chatId]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    try {
      setIsLoading(true);
      const messagesRef = dbRef(database, `chats/${chatId}/messages`);
      
      // Prepare the message data
      const messageData = {
        content: newMessage,
        sender: user.email || "anonymous",
        senderName: user.name || "Anonymous",
        timestamp: Date.now(),
        type: "text"
      };
      
      // Push message to Firebase
      const newMessageRef = push(messagesRef, messageData);
      
      // Clear input
      setNewMessage("");
      
      // Request AI response if callback provided
      if (onSendMessage) {
        const aiResponse = await onSendMessage(newMessage);
        
        if (aiResponse) {
          // Push AI response to Firebase
          push(messagesRef, {
            content: aiResponse,
            sender: "ai",
            senderName: "AI Assistant",
            timestamp: Date.now(),
            type: "text"
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleAudioMessage = (audioUrl: string) => {
    if (!user) return;
    
    const messagesRef = dbRef(database, `chats/${chatId}/messages`);
    
    // Push audio message to Firebase
    push(messagesRef, {
      content: "[Audio Message]",
      sender: user.email || "anonymous",
      senderName: user.name || "Anonymous",
      timestamp: Date.now(),
      type: "audio",
      audioUrl
    });
    
    // Hide audio recorder after sending
    setShowAudioRecorder(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mb-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>
      
        <TabsContent value="chat" className="flex-1 flex flex-col space-y-2 px-4">
          <ScrollArea className="flex-1 p-2 rounded-md bg-accent/20">
            <div className="space-y-2">
              {messages.map((message) => (
                <Card 
                  key={message.id}
                  className={`
                    ${message.sender === user?.email ? 'ml-auto bg-primary text-primary-foreground' : 
                     message.sender === 'ai' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}
                    max-w-[80%] break-words
                  `}
                >
                  <CardContent className="p-3">
                    <div className="text-xs opacity-70 mb-1">
                      {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    
                    {message.type === 'audio' ? (
                      <audio controls src={message.audioUrl} className="max-w-full" />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex items-center space-x-2 mb-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="flex-1 flex flex-col px-4">
          <Card className="flex-1">
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
              <h3 className="text-lg font-medium">Record Audio Message</h3>
              <AudioRecorder onAudioUrlReady={handleAudioMessage} chatId={chatId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}