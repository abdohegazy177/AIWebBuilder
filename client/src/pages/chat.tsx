import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { Menu, Download, MoreVertical, Code, Palette, Briefcase, GraduationCap, BarChart3, Lightbulb } from "lucide-react";
import type { ChatSession, Message } from "@shared/schema";

export default function Chat() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"],
  });

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
        personality
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
    return names[personality as keyof typeof names] || 'مساعد ذكي';
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
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedPersonality ? getPersonalityName(selectedPersonality) : 'مساعد ذكي'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-500">متصل</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
