import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/context/workspace-context";
import { 
  FileIcon, 
  MessageSquarePlus, 
  FolderIcon, 
  MoonIcon, 
  HelpCircleIcon,
  Code,
  Settings,
  Mic,
  Cloud,
  Database,
  User,
  LogOut,
  Mail,
  Server,
  CloudCog,
  File,
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { nanoid } from "nanoid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { 
    chats, 
    projects, 
    selectedChat, 
    selectedProject,
    setSelectedChat,
    setSelectedProject,
    createNewChat
  } = useWorkspace();
  const [location] = useLocation();
  
  const handleNewChat = () => {
    console.log("Creating new chat...");
    const newChatId = nanoid();
    const newChat = createNewChat(newChatId, "New Conversation");
    console.log("New chat created:", newChat);
    
    // Use timeout to ensure state updates before navigation
    setTimeout(() => {
      setSelectedChat(newChatId);
      console.log("Selected chat set to:", newChatId);
      
      // Force navigation to home to refresh the view
      window.location.href = "/";
    }, 100);
  };
  
  const isMobile = window.innerWidth < 768;
  
  // Function to open external links
  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-16 md:w-56 bg-[#1E1E1E] border-r border-[#333333] flex flex-col h-full">
      {/* User profile section at the top */}
      <div className="p-2 md:p-4 border-b border-[#333333]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-center md:justify-start gap-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.email ? 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random` : 
                    "/user-icon.png"} 
                  alt={user?.name} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="font-medium text-sm truncate">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">Google Account</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openExternalLink('https://console.cloud.google.com')}>
              <CloudCog className="mr-2 h-4 w-4" />
              <span>Google Cloud Console</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExternalLink('https://mail.google.com')}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Gmail</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExternalLink('https://drive.google.com')}>
              <File className="mr-2 h-4 w-4" />
              <span>Google Drive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExternalLink('https://firebase.google.com/console')}>
              <Server className="mr-2 h-4 w-4" />
              <span>Firebase Console</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExternalLink('https://myaccount.google.com')}>
              <User className="mr-2 h-4 w-4" />
              <span>Manage Account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openExternalLink('https://ai.google.dev')}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Google AI Studio</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                logout();
                window.location.href = "/auth";
              }}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="p-2 md:p-4">
        <Button
          variant="default"
          className="flex justify-center md:justify-start items-center w-full"
          onClick={handleNewChat}
        >
          <MessageSquarePlus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">New Chat</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="mb-4">
          <h2 className="text-xs uppercase text-muted-foreground px-2 py-1 hidden md:block">
            Recent Chats
          </h2>
          
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
                selectedChat === chat.id ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <FileIcon className="h-4 w-4 md:mr-2" />
              <span className="truncate hidden md:inline">{chat.title}</span>
            </Button>
          ))}
          
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground px-4 py-2 hidden md:block">
              No recent chats
            </p>
          )}
        </div>
        
        <div>
          <h2 className="text-xs uppercase text-muted-foreground px-2 py-1 hidden md:block">
            Saved Projects
          </h2>
          
          {projects.map((project) => (
            <Button
              key={project.id}
              variant="ghost"
              className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
                selectedProject === project.id ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <FolderIcon className="h-4 w-4 md:mr-2" />
              <span className="truncate hidden md:inline">{project.name}</span>
            </Button>
          ))}
          
          {projects.length === 0 && (
            <p className="text-xs text-muted-foreground px-4 py-2 hidden md:block">
              No saved projects
            </p>
          )}
        </div>
      </div>
      
      <div className="p-2 border-t border-[#333333]">
        <h2 className="text-xs uppercase text-muted-foreground px-2 py-1 hidden md:block">
          Features
        </h2>

        <Link href="/">
          <Button
            variant="ghost"
            className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
              location === "/" ? "bg-accent" : ""
            }`}
          >
            <MessageSquarePlus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Chat</span>
          </Button>
        </Link>
        
        <Link href="/enhanced-chat">
          <Button
            variant="ghost"
            className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
              location === "/enhanced-chat" ? "bg-accent" : ""
            }`}
          >
            <Sparkles className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Enhanced Chat</span>
          </Button>
        </Link>

        <Link href="/code">
          <Button
            variant="ghost"
            className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
              location === "/code" ? "bg-accent" : ""
            }`}
          >
            <Code className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Code</span>
          </Button>
        </Link>

        <Link href="/settings">
          <Button
            variant="ghost"
            className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
              location === "/settings" ? "bg-accent" : ""
            }`}
          >
            <Settings className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </Link>

        <Link href="/firebase">
          <Button
            variant="ghost"
            className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
              (location.startsWith("/firebase") && !location.startsWith("/firebase-extensions")) ? "bg-accent" : ""
            }`}
          >
            <Mic className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Audio & Chat</span>
          </Button>
        </Link>
        
        <Link href="/firebase-extensions">
          <Button
            variant="ghost"
            className={`flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1 ${
              location.startsWith("/firebase-extensions") ? "bg-accent" : ""
            }`}
          >
            <Database className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Firebase Extensions</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          className="flex justify-center md:justify-start items-center w-full px-2 py-2 mb-1"
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          <MoonIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Dark Mode</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex justify-center md:justify-start items-center w-full px-2 py-2"
          onClick={() => window.open('https://github.com/genkit-ai/genkit', '_blank')}
        >
          <HelpCircleIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Help & Docs</span>
        </Button>
      </div>
    </div>
  );
}
