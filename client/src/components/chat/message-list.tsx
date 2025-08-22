import { useEffect, useRef } from "react";
import { Message } from "./message";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message as MessageType } from "@shared/schema";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  isTyping: boolean;
}

export function MessageList({ messages, isLoading, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-end">
            <div className="max-w-xs lg:max-w-md">
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-robot text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">مرحباً بك في مساعد الذكاء الاصطناعي</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            يمكنني مساعدتك في الإجابة على أسئلتك، حل المشاكل، أو حتى إجراء محادثة ودية. كيف يمكنني مساعدتك اليوم؟
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <Message key={message.id} message={message} />
        ))
      )}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-end animate-fade-in">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-600">يكتب</span>
                <div className="flex gap-1 ml-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
