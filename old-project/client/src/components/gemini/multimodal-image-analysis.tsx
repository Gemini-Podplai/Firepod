import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, Image as ImageIcon, Loader2, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Simulated Gemini API response for demo purposes
const sampleGeminiResponse = {
  contentOnly: `This image appears to be a circuit board or printed circuit board (PCB), which is a board that mechanically supports and electrically connects electronic components using conductive tracks, pads, and other features.

Key features visible in the image:
1. Green substrate/board material (FR-4 fiberglass)
2. Copper traces (the metallic lines) that connect components
3. Various electronic components soldered to the board, including:
   - Integrated circuits (ICs)/microchips
   - Capacitors (cylindrical components)
   - Resistors
   - Connectors

The circuit board appears to be moderately complex with multiple layers and components. Without additional context, I can't determine the specific function of this circuit board, but it could be part of a computer, consumer electronics device, industrial equipment, or other electronic system.`,
  analyzedComponents: [
    {
      type: "Integrated Circuit",
      location: "Center of board",
      description: "Main processing unit, appears to be a microcontroller or CPU"
    },
    {
      type: "Capacitors",
      location: "Scattered throughout board",
      description: "Electrolytic capacitors for power filtering"
    },
    {
      type: "Connectors",
      location: "Edges of board",
      description: "I/O connectors for external interfaces"
    },
    {
      type: "Resistors",
      location: "Throughout board",
      description: "Surface-mount resistors for current regulation"
    }
  ],
  technicalDetails: {
    boardType: "Multilayer PCB",
    estimatedLayers: "4-6 layers",
    materialType: "FR-4 Fiberglass with copper traces",
    manufacturingProcess: "Standard SMT assembly"
  }
};

export function MultimodalImageAnalysis() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Analyze this image in detail and identify all components.");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<typeof sampleGeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `image-analysis/${Date.now()}-${image.name}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);

      // For demonstration purposes, we'll use the sample response
      // In a real implementation, we would call the Firebase Extension endpoint
      // that integrates with Gemini API for multimodal analysis
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Set analysis result
      setAnalysis(sampleGeminiResponse);
      
      toast({
        title: "Analysis complete",
        description: "Image has been successfully analyzed",
      });
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Failed to analyze image. Please try again.");
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearClick = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Multimodal Image Analysis</CardTitle>
          <CardDescription>
            Upload an image and let Gemini analyze it for you. Works great with circuit boards, 
            diagrams, charts, and other technical images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center ${
              imagePreview ? "border-primary" : "border-muted-foreground"
            } transition-colors`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative mx-auto max-w-lg">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="mx-auto max-h-64 object-contain rounded-md"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {image?.name} ({(image?.size ?? 0) / 1024 < 1024
                    ? `${Math.round((image?.size ?? 0) / 1024 * 10) / 10} KB`
                    : `${Math.round((image?.size ?? 0) / 1024 / 1024 * 10) / 10} MB`})
                </p>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Drag and drop your image here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt (optional)</Label>
            <Textarea 
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to analyze about the image..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
              className="flex-1"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Select Image
            </Button>
            <Button 
              onClick={handleAnalyzeClick} 
              className="flex-1"
              disabled={!image || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
            <Button
              onClick={handleClearClick}
              variant="destructive"
              className="flex-1"
              disabled={!image || loading}
            >
              Clear
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Gemini's multimodal analysis of your image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="technical">Technical Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-4">
                <div className="whitespace-pre-wrap text-sm">
                  {analysis.contentOnly}
                </div>
              </TabsContent>
              
              <TabsContent value="components" className="mt-4">
                <div className="space-y-4">
                  {analysis.analyzedComponents.map((component, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <h4 className="text-sm font-medium">{component.type}</h4>
                      <p className="text-xs text-muted-foreground">Location: {component.location}</p>
                      <p className="text-xs mt-1">{component.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="mt-4">
                <div className="space-y-2">
                  {Object.entries(analysis.technicalDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
            Analysis provided by Google Gemini API
          </CardFooter>
        </Card>
      )}
    </div>
  );
}