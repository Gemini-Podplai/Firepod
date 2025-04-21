import { useState, useRef, useEffect } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Upload } from "lucide-react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onAudioUrlReady?: (url: string) => void;
  chatId?: string;
}

export default function AudioRecorder({ onAudioUrlReady, chatId = "default" }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = [];
      setAudioBlob(null);
      setAudioURL(null);
      
      // Request microphone access with explicit constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setRecording(true);
      
      toast({
        title: "Recording started",
        description: "Your microphone is now active",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "Recording stopped",
        description: "Your recording is ready for review",
      });
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) {
      toast({
        title: "Error",
        description: "No audio to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const fileName = `recordings/${chatId}/${nanoid()}.mp3`;
      const storageRef = ref(storage, fileName);
      
      // Upload the audio file
      const snapshot = await uploadBytes(storageRef, audioBlob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (onAudioUrlReady) {
        onAudioUrlReady(downloadURL);
      }
      
      toast({
        title: "Upload successful",
        description: "Your audio message has been uploaded",
      });
      
      // Reset state after successful upload
      setAudioBlob(null);
      setAudioURL(null);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload your audio message",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {!recording && !audioURL && (
          <Button 
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Mic className="h-4 w-4" />
            <span>Start Recording</span>
          </Button>
        )}
        
        {recording && (
          <Button 
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Square className="h-4 w-4" />
            <span>Stop Recording</span>
          </Button>
        )}
        
        {audioURL && (
          <>
            <audio controls src={audioURL} className="max-w-full" />
            
            <Button
              onClick={uploadAudio}
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="flex items-center space-x-1"
            >
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}