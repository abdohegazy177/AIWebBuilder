import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { Menu, Download, MoreVertical, Code, Palette, Briefcase, GraduationCap, BarChart3, Lightbulb, Settings } from "lucide-react";
import type { ChatSession, Message } from "@shared/schema";
import { Link } from "wouter";

interface Settings {
  theme: string;
  primaryColor: string;
  tone: string;
  customPersonalities: Array<{
    id: string;
    name: string;
    description: string;
    prompt: string;
    icon: string;
  }>;
  quickShortcuts: Array<{ id: string; title: string; text: string }>;
}

export default function Chat() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<string>("");
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    primaryColor: 'green',
    tone: 'friendly',
    customPersonalities: [],
    quickShortcuts: []
  });
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"],
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Apply theme
      document.documentElement.className = parsedSettings.theme;
      
      // Apply primary color
      const hues = {
        green: '142', blue: '210', purple: '270', 
        red: '0', orange: '30', pink: '320'
      };
      const hue = hues[parsedSettings.primaryColor as keyof typeof hues] || '142';
      document.documentElement.style.setProperty('--primary-hue', hue);
    }
  }, []);

  // Fetch messages for current session
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat-sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
  });

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat-sessions", {
        title: "محادثة جديدة",
        userId: null
      });
      return response.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
      setCurrentSessionId(newSession.id);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content, personality }: { sessionId: string; content: string; personality?: string }) => {
      const response = await apiRequest("POST", `/api/chat-sessions/${sessionId}/messages`, {
        content,
        personality: personality || selectedPersonality,
        tone: settings.tone
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat-sessions", currentSessionId, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
    },
  });

  // Auto-create first session if none exist
  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0 && !currentSessionId) {
      createSessionMutation.mutate();
    } else if (sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, sessionsLoading, currentSessionId]);

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  const handleSendMessage = (content: string) => {
    if (!currentSessionId) return;
    sendMessageMutation.mutate({ sessionId: currentSessionId, content, personality: selectedPersonality });
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const getPersonalityName = (personality: string) => {
    const names = {
      developer: 'مبرمج محترف',
      designer: 'مصمم مبدع',
      business: 'مستشار أعمال',
      teacher: 'معلم خبير',
      analyst: 'محلل بيانات',
      creative: 'مبدع مفكر'
    };
    
    // Check custom personalities
    const customPersonality = settings.customPersonalities.find(p => p.id === personality);
    if (customPersonality) {
      return customPersonality.name;
    }
    
    return names[personality as keyof typeof names] || 'مساعد ذكي';
  };

  const getPersonalityIcon = (personality: string) => {
    const customPersonality = settings.customPersonalities.find(p => p.id === personality);
    if (customPersonality) {
      return customPersonality.icon;
    }
    return '🤖';
  };

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className={`bg-white border-l border-slate-200 w-80 flex-shrink-0 ${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col shadow-sm`}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          isCreating={createSessionMutation.isPending}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-sidebar-toggle"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5L8 18c-0.5 1 0.5 2 1.5 1.5L12 18l2.5 1.5c1-0.5 2-0.5 1.5-1.5l-1.5-4.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6zm-1 14l1 2 1-2-1-0.5L11 16z" />
                    <circle cx="10" cy="7" r="1.2" fill="white" opacity="0.8"/>
                    <circle cx="14" cy="7" r="1.2" fill="white" opacity="0.8"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                    {selectedPersonality ? getPersonalityName(selectedPersonality) : 'WORM'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-500">متصل</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="icon" data-testid="button-settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" data-testid="button-download">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-more">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Personality Selection */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={selectedPersonality === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("")}
              className="h-8 text-xs"
              data-testid="personality-general"
            >
              <i className="fas fa-robot ml-2 text-xs"></i>
              عام
            </Button>
            
            <Button
              variant={selectedPersonality === "developer" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("developer")}
              className="h-8 text-xs"
              data-testid="personality-developer"
            >
              <Code className="h-3 w-3 ml-2" />
              مبرمج
            </Button>
            
            <Button
              variant={selectedPersonality === "designer" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("designer")}
              className="h-8 text-xs"
              data-testid="personality-designer"
            >
              <Palette className="h-3 w-3 ml-2" />
              مصمم
            </Button>
            
            <Button
              variant={selectedPersonality === "business" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("business")}
              className="h-8 text-xs"
              data-testid="personality-business"
            >
              <Briefcase className="h-3 w-3 ml-2" />
              أعمال
            </Button>
            
            <Button
              variant={selectedPersonality === "teacher" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("teacher")}
              className="h-8 text-xs"
              data-testid="personality-teacher"
            >
              <GraduationCap className="h-3 w-3 ml-2" />
              معلم
            </Button>
            
            <Button
              variant={selectedPersonality === "analyst" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("analyst")}
              className="h-8 text-xs"
              data-testid="personality-analyst"
            >
              <BarChart3 className="h-3 w-3 ml-2" />
              محلل
            </Button>
            
            <Button
              variant={selectedPersonality === "creative" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPersonality("creative")}
              className="h-8 text-xs"
              data-testid="personality-creative"
            >
              <Lightbulb className="h-3 w-3 ml-2" />
              مبدع
            </Button>

            {/* Custom Personalities */}
            {settings.customPersonalities.map(personality => (
              <Button
                key={personality.id}
                variant={selectedPersonality === personality.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPersonality(personality.id)}
                className="h-8 text-xs"
                data-testid={`personality-${personality.id}`}
              >
                <span className="ml-2 text-xs">{personality.icon}</span>
                {personality.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <MessageList 
            messages={messages}
            isLoading={messagesLoading}
            isTyping={sendMessageMutation.isPending}
          />
        </div>

        {/* Input */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
          disabled={!currentSessionId}
        />
      </div>
    </div>
  );
}
