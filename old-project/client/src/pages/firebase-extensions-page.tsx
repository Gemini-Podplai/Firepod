import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeminiChatbot } from "@/components/gemini/gemini-chatbot";
import { MultimodalImageAnalysis } from "@/components/gemini/multimodal-image-analysis";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExtensionCard {
  id: string;
  title: string;
  description: string;
  status: "installed" | "not-installed" | "demo";
  docsUrl: string;
}

const FIREBASE_EXTENSIONS: ExtensionCard[] = [
  {
    id: "gemini-chatbot",
    title: "Gemini Chatbot",
    description: "Add an AI chat experience powered by Google's Gemini models",
    status: "demo",
    docsUrl: "https://firebase.google.com/docs/extensions",
  },
  {
    id: "multimodal-image",
    title: "Multimodal Image Analysis",
    description: "Analyze images using Google's Gemini Vision models",
    status: "demo",
    docsUrl: "https://firebase.google.com/docs/extensions",
  },
  {
    id: "chatgpt-bot",
    title: "Chatbot with ChatGPT",
    description: "Deploy customizable chatbots using ChatGPT API and Cloud Functions",
    status: "not-installed",
    docsUrl: "https://firebase.google.com/extensions/openai/chatbot-with-chatgpt",
  },
  {
    id: "speech-to-text",
    title: "Transcribe Speech to Text",
    description: "Transcribe audio files in Cloud Storage to txt using Google Speech-to-Text",
    status: "not-installed",
    docsUrl: "https://firebase.google.com/extensions/cloud/transcribe-speech-to-text",
  },
  {
    id: "export-to-drive",
    title: "Export Storage Files to Google Drive",
    description: "Exports cloud storage files to google drive in response to triggers",
    status: "not-installed",
    docsUrl: "https://firebase.google.com/extensions/google/export-storage-files-to-google-drive",
  },
];

export default function FirebaseExtensionsPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedExtension, setSelectedExtension] = useState<ExtensionCard | null>(null);

  const handleExtensionClick = (extension: ExtensionCard) => {
    setSelectedExtension(extension);
    setActiveTab("demo");
  };

  return (
    <div className="container py-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Firebase Extensions</h1>
          <p className="text-muted-foreground">
            Enhance your app with pre-packaged solutions that save development time.
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://firebase.google.com/docs/extensions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline">
                  Firebase Extensions Docs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>View the official Firebase Extensions documentation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-600">Demo Mode</AlertTitle>
        <AlertDescription>
          This is a demonstration of Firebase Extensions integration. Some functionality is simulated
          for demonstration purposes.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Extensions</TabsTrigger>
          <TabsTrigger value="demo" disabled={!selectedExtension}>
            {selectedExtension ? `Demo: ${selectedExtension.title}` : "Select an Extension"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FIREBASE_EXTENSIONS.map((extension) => (
              <Card
                key={extension.id}
                className={`cursor-pointer hover:border-primary/50 transition-colors ${
                  extension.status === "installed" ? "border-green-400" : ""
                }`}
                onClick={() => {
                  // Only allow clicking on extensions with demo implementation
                  if (extension.status === "demo") {
                    handleExtensionClick(extension);
                  }
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{extension.title}</CardTitle>
                    {extension.status === "installed" && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Installed
                      </span>
                    )}
                    {extension.status === "demo" && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Demo
                      </span>
                    )}
                  </div>
                  <CardDescription>{extension.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <a
                      href={extension.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="mr-1 h-3 w-3" />
                      Documentation
                    </a>
                    {extension.status === "demo" ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExtensionClick(extension);
                        }}
                      >
                        View Demo
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        {extension.status === "installed" ? "Configure" : "Install"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demo" className="pt-4">
          {selectedExtension && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedExtension.title}</h2>
                  <p className="text-muted-foreground">{selectedExtension.description}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab("browse");
                  }}
                >
                  Back to Browse
                </Button>
              </div>

              {selectedExtension.id === "gemini-chatbot" && (
                <div className="h-[600px]">
                  <GeminiChatbot />
                </div>
              )}

              {selectedExtension.id === "multimodal-image" && (
                <div>
                  <MultimodalImageAnalysis />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}