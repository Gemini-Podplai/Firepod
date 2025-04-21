import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type ModelSettings = {
  // Core settings
  model: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
  
  // Enhanced capabilities
  enableWebSearch: boolean;
  enableCodeExecution: boolean;
  enableCodeInterpreter: boolean;
  enableToolUse: boolean;
  
  // Personality settings
  systemPrompt: string;
  chatPersona: string;
};

export type ModelPreset = {
  id: string;
  name: string;
  description: string;
  settings: ModelSettings;
};

const DEFAULT_PRESETS: ModelPreset[] = [
  {
    id: "default",
    name: "Balanced",
    description: "Default balanced settings with moderate creativity",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.95,
      topK: 40,
      enableWebSearch: false,
      enableCodeExecution: false,
      enableCodeInterpreter: false,
      enableToolUse: false,
      systemPrompt: "You are a helpful AI assistant. Respond to user queries accurately, concisely, and helpfully.",
      chatPersona: "balanced",
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Higher creativity and more varied responses",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.9,
      maxOutputTokens: 2048,
      topP: 0.98,
      topK: 60,
      enableWebSearch: false,
      enableCodeExecution: false,
      enableCodeInterpreter: false,
      enableToolUse: false,
      systemPrompt: "You are a creative AI assistant. Think outside the box and provide imaginative, unique, and thoughtful responses.",
      chatPersona: "creative",
    },
  },
  {
    id: "precise",
    name: "Precise",
    description: "More factual, concise, and deterministic responses",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.2,
      maxOutputTokens: 1024,
      topP: 0.7,
      topK: 20,
      enableWebSearch: true,
      enableCodeExecution: false,
      enableCodeInterpreter: true,
      enableToolUse: false,
      systemPrompt: "You are a precise AI assistant. Provide clear, accurate, and concise responses. Admit when you don't know something rather than speculating.",
      chatPersona: "precise",
    },
  },
  {
    id: "coding",
    name: "Code Assistant",
    description: "Optimized for programming and technical tasks",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.3,
      maxOutputTokens: 4096,
      topP: 0.8,
      topK: 30,
      enableWebSearch: true,
      enableCodeExecution: true,
      enableCodeInterpreter: true,
      enableToolUse: true,
      systemPrompt: "You are a programming assistant. Provide clean, efficient, and well-documented code examples. Explain your code and reasoning clearly. Consider best practices, edge cases, and potential optimizations.",
      chatPersona: "coding",
    },
  },
  {
    id: "brainstorm",
    name: "Brainstorming",
    description: "Maximum creativity for idea generation",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 1.0,
      maxOutputTokens: 4096,
      topP: 1.0,
      topK: 80,
      enableWebSearch: true,
      enableCodeExecution: false,
      enableCodeInterpreter: false,
      enableToolUse: true,
      systemPrompt: "You are a brainstorming partner. Generate diverse, innovative ideas without self-criticism. Think broadly and consider multiple perspectives and approaches. Don't limit yourself to conventional thinking.",
      chatPersona: "brainstorm",
    },
  },
  {
    id: "researcher",
    name: "Research Assistant",
    description: "Thorough analysis with citations and references",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.4,
      maxOutputTokens: 8192,
      topP: 0.85,
      topK: 40,
      enableWebSearch: true,
      enableCodeExecution: false,
      enableCodeInterpreter: true,
      enableToolUse: true,
      systemPrompt: "You are a research assistant. Provide comprehensive, well-structured analyses with proper citations when possible. Consider multiple perspectives, weigh evidence carefully, and identify areas of uncertainty.",
      chatPersona: "researcher",
    },
  },
  {
    id: "friendly",
    name: "Friendly Companion",
    description: "Casual, empathetic, and conversational",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.8,
      maxOutputTokens: 1024,
      topP: 0.95,
      topK: 50,
      enableWebSearch: false,
      enableCodeExecution: false,
      enableCodeInterpreter: false,
      enableToolUse: false,
      systemPrompt: "You are a friendly, supportive companion. Respond with warmth, empathy, and conversational language. Show interest in the user's thoughts and feelings, and make them feel heard and understood.",
      chatPersona: "friendly",
    },
  },
  {
    id: "instructor",
    name: "Teacher",
    description: "Clear explanations optimized for learning",
    settings: {
      model: "gemini-1.5-pro",
      temperature: 0.5,
      maxOutputTokens: 4096,
      topP: 0.9,
      topK: 40,
      enableWebSearch: true,
      enableCodeExecution: false,
      enableCodeInterpreter: true,
      enableToolUse: true,
      systemPrompt: "You are a patient teacher. Explain concepts clearly and thoroughly, using examples and analogies. Adapt your explanations to different learning levels. Break down complex topics into manageable parts.",
      chatPersona: "instructor",
    },
  }
];

interface ModelSettingsProps {
  currentSettings: ModelSettings;
  onSettingsChange: (settings: ModelSettings) => void;
  availableModels: string[];
}

export function ModelSettingsDialog({ 
  currentSettings, 
  onSettingsChange,
  availableModels = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.0-pro-vision"]
}: ModelSettingsProps) {
  const [settings, setSettings] = useState<ModelSettings>({...currentSettings});
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const { toast } = useToast();

  const handlePresetChange = (presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings({...preset.settings});
      setSelectedPreset(presetId);
      toast({
        title: "Preset Applied",
        description: `Applied the "${preset.name}" preset`,
      });
    }
  };

  const handleSaveSettings = () => {
    onSettingsChange(settings);
    toast({
      title: "Settings Updated",
      description: "Model settings have been updated successfully",
    });
  };

  const personaOptions = [
    { id: "balanced", name: "Balanced" },
    { id: "professional", name: "Professional" },
    { id: "friendly", name: "Friendly" },
    { id: "creative", name: "Creative" },
    { id: "concise", name: "Concise" },
    { id: "technical", name: "Technical" },
    { id: "casual", name: "Casual" },
    { id: "enthusiastic", name: "Enthusiastic" },
    { id: "empathetic", name: "Empathetic" },
    { id: "analytical", name: "Analytical" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Model Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Settings</DialogTitle>
          <DialogDescription>
            Configure model parameters and behavior to customize the AI's responses
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Presets */}
          <div>
            <Label>Presets</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {DEFAULT_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant={selectedPreset === preset.id ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-2 px-3 flex flex-col items-start"
                  onClick={() => handlePresetChange(preset.id)}
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground mt-1 text-left">
                    {preset.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {/* Core Model Settings */}
            <AccordionItem value="model-parameters">
              <AccordionTrigger className="text-base">Model Parameters</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select
                      value={settings.model}
                      onValueChange={(value) => setSettings({ ...settings, model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select which AI model to use for generating responses
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.temperature]}
                      onValueChange={(value) => setSettings({ ...settings, temperature: value[0] })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls randomness: Lower values are more deterministic, higher values more creative
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens">Max Output Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min={1}
                      max={32768}
                      value={settings.maxOutputTokens}
                      onChange={(e) => setSettings({ ...settings, maxOutputTokens: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum number of tokens to generate in the response
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="topP">Top P: {settings.topP.toFixed(2)}</Label>
                    </div>
                    <Slider
                      id="topP"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[settings.topP]}
                      onValueChange={(value) => setSettings({ ...settings, topP: value[0] })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Token selection: only tokens with a cumulative probability above this threshold are considered
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="topK">Top K: {settings.topK}</Label>
                    <Slider
                      id="topK"
                      min={1}
                      max={100}
                      step={1}
                      value={[settings.topK]}
                      onValueChange={(value) => setSettings({ ...settings, topK: value[0] })}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only consider the top K tokens with highest probability
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Enhanced Capabilities */}
            <AccordionItem value="enhanced-capabilities">
              <AccordionTrigger className="text-base">Enhanced Capabilities</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableWebSearch"
                      checked={settings.enableWebSearch}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableWebSearch: checked })}
                    />
                    <Label htmlFor="enableWebSearch">Enable Web Search</Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 ml-12">
                    Allow the model to search the web for current information
                  </p>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableCodeExecution"
                      checked={settings.enableCodeExecution}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableCodeExecution: checked })}
                    />
                    <Label htmlFor="enableCodeExecution">Enable Code Execution</Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 ml-12">
                    Allow the model to execute code in a sandbox environment
                  </p>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableCodeInterpreter"
                      checked={settings.enableCodeInterpreter}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableCodeInterpreter: checked })}
                    />
                    <Label htmlFor="enableCodeInterpreter">Enable Code Interpreter</Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 ml-12">
                    Allow the model to interpret and run code for data analysis and visualization
                  </p>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableToolUse"
                      checked={settings.enableToolUse}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableToolUse: checked })}
                    />
                    <Label htmlFor="enableToolUse">Enable Function Calling</Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2 ml-12">
                    Allow the model to call external functions and APIs
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Personality Settings */}
            <AccordionItem value="personality-settings">
              <AccordionTrigger className="text-base">Personality & Behavior</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="chatPersona">Conversation Style</Label>
                    <Select
                      value={settings.chatPersona}
                      onValueChange={(value) => setSettings({ ...settings, chatPersona: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select persona" />
                      </SelectTrigger>
                      <SelectContent>
                        {personaOptions.map((persona) => (
                          <SelectItem key={persona.id} value={persona.id}>
                            {persona.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the conversational style the AI should adopt
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="Enter custom system instructions"
                      value={settings.systemPrompt}
                      onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                      className="mt-1 h-32"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      System instructions define the AI's role, personality, and limitations
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setSettings({...currentSettings})}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModelSettingsDialog;