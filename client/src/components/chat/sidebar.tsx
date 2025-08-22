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
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5L8 18c-0.5 1 0.5 2 1.5 1.5L12 18l2.5 1.5c1-0.5 2-0.5 1.5-1.5l-1.5-4.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6zm-1 14l1 2 1-2-1-0.5L11 16z" />
              <circle cx="10" cy="7" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="14" cy="7" r="1.5" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">WORM</h1>
            <p className="text-sm text-slate-500">مساعد ذكي متطور وخيالي</p>
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
