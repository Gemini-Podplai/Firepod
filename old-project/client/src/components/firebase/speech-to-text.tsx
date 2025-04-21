import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpeechToTextProps {
  onTranscriptReady?: (transcript: string) => void;
  onInterimTranscript?: (transcript: string) => void;
  autoStart?: boolean;
  continuous?: boolean;
}

export default function SpeechToText({
  onTranscriptReady,
  onInterimTranscript,
  autoStart = false,
  continuous = true,
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition features",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        if (onTranscriptReady) {
          onTranscriptReady(finalTranscript);
        }
      }

      if (interimTranscript) {
        setInterimTranscript(interimTranscript);
        if (onInterimTranscript) {
          onInterimTranscript(interimTranscript);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'no-speech') {
        // This is a common error, so we don't need to show a toast
        console.log('No speech detected');
      } else {
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Auto-start if specified
    if (autoStart) {
      startListening();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSpeechSupported, continuous, autoStart, onTranscriptReady, onInterimTranscript, toast]);

  const startListening = () => {
    if (!isSpeechSupported) return;

    setTranscript("");
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening",
        description: "Speak now...",
      });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: "Error",
        description: "Could not start speech recognition",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (!isSpeechSupported || !recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);
    toast({
      title: "Stopped listening",
      description: transcript ? "Transcript ready" : "No speech detected",
    });
  };

  if (!isSpeechSupported) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">
            Speech recognition is not supported by your browser.
            Try using Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        {isListening ? (
          <Button
            onClick={stopListening}
            variant="destructive"
            size="sm"
            className="flex items-center space-x-1"
          >
            <MicOff className="h-4 w-4" />
            <span>Stop Listening</span>
          </Button>
        ) : (
          <Button
            onClick={startListening}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Mic className="h-4 w-4" />
            <span>Start Listening</span>
          </Button>
        )}
        
        {isListening && (
          <Badge variant="outline" className="animate-pulse">
            Listening...
          </Badge>
        )}
      </div>
      
      {interimTranscript && (
        <p className="text-sm italic text-muted-foreground">
          {interimTranscript}
        </p>
      )}
      
      {transcript && (
        <div className="p-3 bg-muted rounded-md">
          <p className="whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
}