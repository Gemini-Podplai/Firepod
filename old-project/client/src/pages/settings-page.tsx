import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  AIModel, 
  AIModelParameters, 
  DEFAULT_MODEL,
  DEFAULT_PARAMETERS
} from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ModelSelector } from "@/components/common/model-selector";
import { ParametersPanel } from "@/components/common/parameters-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SettingsPage() {
  const [model, setModel] = useState<AIModel>(DEFAULT_MODEL);
  const [parameters, setParameters] = useState<AIModelParameters>(DEFAULT_PARAMETERS);
  const [activeTab, setActiveTab] = useState("general");
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [enableBeta, setEnableBeta] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const { toast } = useToast();
  
  // Load saved preferences
  useEffect(() => {
    const savedModel = localStorage.getItem("defaultModel");
    const savedParameters = localStorage.getItem("defaultParameters");
    const savedStreamingPref = localStorage.getItem("useStreaming");
    const savedDebugMode = localStorage.getItem("debugMode");
    const savedBetaFeatures = localStorage.getItem("betaFeatures");
    const savedApiKey = localStorage.getItem("customApiKey");
    
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
    
    if (savedDebugMode) {
      try {
        setDebugMode(JSON.parse(savedDebugMode));
      } catch (e) {
        console.error("Failed to parse debug mode setting:", e);
      }
    }
    
    if (savedBetaFeatures) {
      try {
        setEnableBeta(JSON.parse(savedBetaFeatures));
      } catch (e) {
        console.error("Failed to parse beta features setting:", e);
      }
    }
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("defaultModel", JSON.stringify(model));
    localStorage.setItem("defaultParameters", JSON.stringify(parameters));
    localStorage.setItem("useStreaming", JSON.stringify(useStreaming));
    localStorage.setItem("debugMode", JSON.stringify(debugMode));
    localStorage.setItem("betaFeatures", JSON.stringify(enableBeta));
    
    if (apiKey) {
      localStorage.setItem("customApiKey", apiKey);
    }
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully"
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header selectedModel={model} onSelectModel={setModel} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="models">AI Models</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Application Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="Your username" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="auto-save" />
                  <Label htmlFor="auto-save">Auto-save code changes</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable desktop notifications</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Default AI Model</h2>
                <p className="text-muted-foreground">
                  Select your preferred AI model for chat and code generation
                </p>
                
                <div className="p-4 border rounded-lg">
                  <ModelSelector selectedModel={model} onSelectModel={setModel} />
                </div>
                
                <h2 className="text-xl font-semibold mt-8">Model Parameters</h2>
                <p className="text-muted-foreground">
                  Customize the behavior of AI models
                </p>
                
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Response Generation</CardTitle>
                    <CardDescription>Configure how AI responses are delivered</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="streaming-mode" className="font-medium">Streaming Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Show AI responses as they're being generated
                        </p>
                      </div>
                      <Switch 
                        id="streaming-mode" 
                        checked={useStreaming}
                        onCheckedChange={setUseStreaming}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <ParametersPanel 
                  parameters={parameters} 
                  onUpdateParameters={setParameters} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Theme Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border p-4 rounded-lg cursor-pointer hover:border-primary">
                    <div className="h-20 bg-[#1E1E1E] rounded-md mb-2"></div>
                    <p className="font-medium">Dark Theme</p>
                  </div>
                  
                  <div className="border p-4 rounded-lg cursor-pointer hover:border-primary">
                    <div className="h-20 bg-[#FFFFFF] rounded-md mb-2"></div>
                    <p className="font-medium">Light Theme</p>
                  </div>
                  
                  <div className="border p-4 rounded-lg cursor-pointer hover:border-primary">
                    <div className="h-20 bg-gradient-to-b from-[#1E1E1E] to-[#2D2D2D] rounded-md mb-2"></div>
                    <p className="font-medium">System Default</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Font Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline">Small</Button>
                    <Button variant="default">Medium</Button>
                    <Button variant="outline">Large</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Advanced Options</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Custom API Key (Optional)</Label>
                  <Input 
                    id="apiKey" 
                    type="password" 
                    placeholder="Enter your custom API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide your own API key to increase rate limits
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="debug-mode" 
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                  <Label htmlFor="debug-mode">Enable debug mode</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="beta-features" 
                    checked={enableBeta}
                    onCheckedChange={setEnableBeta}
                  />
                  <Label htmlFor="beta-features">Enable beta features</Label>
                </div>
                
                <div className="mt-6 space-y-2">
                  <Button variant="destructive" size="sm">
                    Clear Cache
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Removes all locally cached data and resets the application
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 border-t pt-6 flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              className="px-8"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}