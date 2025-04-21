import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import RealTimeChat from "./real-time-chat";
import { database } from "@/lib/firebase";
import { ref as dbRef, set, push, get } from "firebase/database";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { AIModel, AIModelParameters, DEFAULT_MODEL, DEFAULT_PARAMETERS } from "@/lib/openai";
import { sendChatMessageGemini } from "@/lib/googleai";

export default function ChatWithAI() {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { chatId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat list
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["firebase-chats", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const userChatsRef = dbRef(database, `users/${user.email.replace(/[.#$]/g, '_')}/chats`);
      const snapshot = await get(userChatsRef);
      const chatsData = snapshot.val() || {};
      
      return Object.entries(chatsData).map(([id, data]: [string, any]) => ({
        id,
        title: data.title,
        createdAt: data.createdAt,
      }));
    },
    enabled: !!user?.email,
  });

  // If no chat is selected and chats exist, navigate to the first chat
  useEffect(() => {
    if (!chatId && chats.length > 0 && !isLoading) {
      setLocation(`/firebase-chat/${chats[0].id}`);
    }
  }, [chatId, chats, isLoading, setLocation]);

  // Create a new chat
  const createNewChat = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chat",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreatingChat(true);
      
      // Generate a new chat ID
      const newChatId = nanoid();
      const userEmail = user.email.replace(/[.#$]/g, '_');
      
      // Create chat data
      const chatData = {
        title: `New Chat ${new Date().toLocaleString()}`,
        createdAt: Date.now(),
        users: {
          [userEmail]: true,
        },
      };
      
      // Save chat data to Firebase
      const chatRef = dbRef(database, `chats/${newChatId}`);
      await set(chatRef, chatData);
      
      // Add chat to user's chat list
      const userChatRef = dbRef(database, `users/${userEmail}/chats/${newChatId}`);
      await set(userChatRef, {
        title: chatData.title,
        createdAt: chatData.createdAt,
      });
      
      // Add welcome message
      const messagesRef = dbRef(database, `chats/${newChatId}/messages`);
      await push(messagesRef, {
        content: "How can I help you today?",
        sender: "ai",
        senderName: "AI Assistant",
        timestamp: Date.now(),
        type: "text",
      });
      
      // Invalidate cache and navigate to new chat
      queryClient.invalidateQueries(["firebase-chats"]);
      setLocation(`/firebase-chat/${newChatId}`);
      
      toast({
        title: "Success",
        description: "New chat created",
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Send message to AI
  const sendMessageToAI = async (message: string): Promise<string | null> => {
    try {
      // This uses the Gemini API from your existing code
      const response = await sendChatMessageGemini(
        DEFAULT_MODEL,
        [{ role: "user", content: message, id: nanoid(), timestamp: Date.now() }],
        DEFAULT_PARAMETERS
      );
      
      return response.content;
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        {/* Chat list sidebar */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Chats</CardTitle>
            <CardDescription>Your conversations</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={createNewChat}
                disabled={isCreatingChat}
                className="w-full flex items-center space-x-2"
              >
                {isCreatingChat ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                <span>New Chat</span>
              </Button>
              
              <div className="space-y-1 mt-4">
                {chats.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={chatId === chat.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setLocation(`/firebase-chat/${chat.id}`)}
                  >
                    {chat.title}
                  </Button>
                ))}
                
                {chats.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">
                    No chats yet. Create a new chat to get started.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Chat area */}
        <Card className="md:col-span-3 flex flex-col overflow-hidden">
          {chatId ? (
            <RealTimeChat 
              chatId={chatId} 
              onSendMessage={sendMessageToAI}
            />
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No chat selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a chat from the sidebar or create a new one
                </p>
                <Button onClick={createNewChat} disabled={isCreatingChat}>
                  {isCreatingChat ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  New Chat
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}