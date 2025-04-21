import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { EnhancedGeminiChatbot } from "@/components/gemini/enhanced-chatbot";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function EnhancedChatPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={40}>
              <EnhancedGeminiChatbot />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30} minSize={20}>
              <div className="h-full flex flex-col p-4">
                <h2 className="text-xl font-semibold mb-4">Enhanced Chat Features</h2>
                
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Model Personality</h3>
                    <p className="text-sm text-muted-foreground">
                      The new enhanced chat allows you to customize the AI's personality and behavior.
                      Click on the Model Settings button in the chat to configure:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                      <li>Temperature (randomness)</li>
                      <li>Max output tokens</li>
                      <li>Top P and Top K sampling</li>
                      <li>Enable web search capabilities</li>
                      <li>Enable code execution and interpretation</li>
                      <li>Set custom system prompts</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Personality Presets</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply one of the following personality presets:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                      <li>Balanced - Standard settings for general use</li>
                      <li>Creative - High creativity for brainstorming and content generation</li>
                      <li>Precise - Low temperature for more deterministic answers</li>
                      <li>Code Assistant - Optimized for programming and technical tasks</li>
                      <li>Brainstorming - Maximum creativity for idea generation</li>
                      <li>Researcher - Thorough analysis with citations and references</li>
                      <li>Friendly Companion - Casual, empathetic, and conversational</li>
                      <li>Teacher - Clear explanations optimized for learning</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Multimodal Input</h3>
                    <p className="text-sm text-muted-foreground">
                      The enhanced chat supports multiple input modes:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                      <li>Text input for standard conversations</li>
                      <li>Voice input for speech-to-text conversations</li>
                      <li>Camera input for image analysis (with vision models)</li>
                      <li>Screen capture for analyzing what's on your screen</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}