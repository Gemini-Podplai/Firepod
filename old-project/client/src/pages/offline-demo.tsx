
import StandaloneChat from "@/components/standalone/standalone-chat";

export default function OfflineDemo() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Offline Demo</h1>
      <p className="mb-4">This is a standalone version that works without external services.</p>
      <div className="h-[600px]">
        <StandaloneChat />
      </div>
    </div>
  );
}
