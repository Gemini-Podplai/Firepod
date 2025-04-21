
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function StandaloneChat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, 
      { role: "user", content: input },
      { role: "assistant", content: "This is a standalone chat simulation. In the full version, this would be processed by Gemini/Firebase." }
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 overflow-auto">
        {messages.map((msg, i) => (
          <Card key={i} className={`p-4 mb-4 ${msg.role === "user" ? "bg-blue-50" : "bg-gray-50"}`}>
            <p>{msg.content}</p>
          </Card>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button onClick={handleSubmit}>Send</Button>
      </div>
    </div>
  );
}
