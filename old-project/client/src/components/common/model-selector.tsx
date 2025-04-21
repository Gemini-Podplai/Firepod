import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AI_MODELS, AIModel } from "@/lib/openai";
import { Cpu, ChevronDown, Info } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case "openai":
        return <SiOpenai className="w-4 h-4 mr-2" />;
      case "google":
        return <FaGoogle className="w-4 h-4 mr-2" />;
      case "anthropic":
        return <Cpu className="w-4 h-4 mr-2" />;
      case "mistral":
        return <Cpu className="w-4 h-4 mr-2" />;
      default:
        return <Cpu className="w-4 h-4 mr-2" />;
    }
  };

  const toggleExpandedInfo = (modelId: string) => {
    if (expandedInfo === modelId) {
      setExpandedInfo(null);
    } else {
      setExpandedInfo(modelId);
    }
  };

  const ModelItem = ({ model }: { model: AIModel }) => (
    <div className="py-1 px-2">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => {
            onSelectModel(model);
            setIsOpen(false);
          }}
        >
          {getModelIcon(model.icon)}
          <span className="font-medium">{model.name}</span>
        </div>

        {(model.description || model.contextWindow || model.bestFor) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandedInfo(model.id);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="max-w-[280px]">
                <p>Click for more details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {expandedInfo === model.id && (
        <div className="mt-2 text-xs border-t pt-2 text-muted-foreground">
          {model.description && (
            <p className="mb-1">{model.description}</p>
          )}
          {model.contextWindow && (
            <p className="mb-1">
              <span className="font-medium text-primary">Context:</span> {model.contextWindow}
            </p>
          )}
          {model.bestFor && (
            <p>
              <span className="font-medium text-primary">Best for:</span> {model.bestFor}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedModel && getModelIcon(selectedModel.icon)}
          <span>{selectedModel?.name}</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>OpenAI Models</span>
            <span className="text-xs text-muted-foreground">gpt-4o, gpt-4-turbo</span>
          </div>
        </DropdownMenuLabel>
        {AI_MODELS.OPENAI.map((model) => (
          <ModelItem key={model.id} model={model} />
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Google Models</span>
            <span className="text-xs text-muted-foreground">Gemini models</span>
          </div>
        </DropdownMenuLabel>
        {AI_MODELS.GOOGLE.map((model) => (
          <ModelItem key={model.id} model={model} />
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Other Models</span>
            <span className="text-xs text-muted-foreground">Claude, Mistral</span>
          </div>
        </DropdownMenuLabel>
        {AI_MODELS.OTHER.map((model) => (
          <ModelItem key={model.id} model={model} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}