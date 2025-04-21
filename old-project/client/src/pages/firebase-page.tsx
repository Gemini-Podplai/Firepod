import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Route, Switch, useLocation, useRoute } from "wouter";
import ChatWithAI from "@/components/firebase/chat-with-ai";
import AudioRecorder from "@/components/firebase/audio-recorder";
import SpeechToText from "@/components/firebase/speech-to-text";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FirebasePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOnChatRoute] = useRoute("/firebase-chat/:chatId");
  const [transcribedText, setTranscribedText] = useState("");
  const { toast } = useToast();

  const handleTranscriptReady = (transcript: string) => {
    setTranscribedText(transcript);
    toast({
      title: "Transcript Ready",
      description: "Your speech has been transcribed",
    });
  };

  const handleAudioUrlReady = (url: string) => {
    toast({
      title: "Audio Uploaded",
      description: "Your audio file is available at: " + url,
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access Firebase features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/auth")}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Features</h1>
      
      <Tabs defaultValue={isOnChatRoute ? "chat" : "features"} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="features" className="flex items-center gap-1">
            <Volume2 className="h-4 w-4" />
            Audio Features
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1" onClick={() => !isOnChatRoute && setLocation("/firebase-chat")}>
            <MessageSquare className="h-4 w-4" />
            Real-time Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Recording Feature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Audio Recording
                </CardTitle>
                <CardDescription>
                  Record audio messages and upload them to Firebase Storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioRecorder onAudioUrlReady={handleAudioUrlReady} />
              </CardContent>
            </Card>
            
            {/* Speech-to-Text Feature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Speech-to-Text
                </CardTitle>
                <CardDescription>
                  Convert your speech to text using the Web Speech API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpeechToText onTranscriptReady={handleTranscriptReady} />
                
                {transcribedText && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Transcribed Text:</h4>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="whitespace-pre-wrap">{transcribedText}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1">
          <Switch>
            <Route path="/firebase-chat/:chatId">
              {(params) => <ChatWithAI />}
            </Route>
            <Route path="/firebase-chat">
              <ChatWithAI />
            </Route>
          </Switch>
        </TabsContent>
      </Tabs>
    </div>
  );
}