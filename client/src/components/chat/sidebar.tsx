import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Settings } from "lucide-react";
import type { ChatSession } from "@shared/schema";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isCreating: boolean;
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  isCreating 
}: SidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return "الآن";
      } else if (diffInHours < 2) {
        return "منذ ساعة";
      } else {
        return `منذ ${Math.floor(diffInHours)} ساعات`;
      }
    } else if (diffInHours < 48) {
      return "أمس";
    } else {
      return "الأسبوع الماضي";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <i className="fas fa-robot text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">مساعد الذكاء الاصطناعي</h1>
            <p className="text-sm text-slate-500">مساعدك الشخصي المدعوم بـ OpenAI</p>
          </div>
        </div>
      </div>

      {/* New chat button */}
      <div className="p-4">
        <Button 
          onClick={onNewChat}
          disabled={isCreating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl gap-2"
          data-testid="button-new-chat"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "جاري الإنشاء..." : "محادثة جديدة"}
        </Button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full p-3 rounded-lg transition-colors duration-200 border text-right ${
                currentSessionId === session.id
                  ? "bg-blue-50 border-blue-200"
                  : "hover:bg-slate-50 border-transparent hover:border-slate-200"
              }`}
              data-testid={`button-session-${session.id}`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 truncate">{session.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
          
          {sessions.length === 0 && !isCreating && (
            <div className="text-center text-slate-500 text-sm py-8">
              لا توجد محادثات بعد
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-slate-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-600 hover:text-slate-900"
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">الإعدادات</span>
        </Button>
      </div>
    </>
  );
}
