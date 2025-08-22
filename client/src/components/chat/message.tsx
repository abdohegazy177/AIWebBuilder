import type { Message as MessageType } from "@shared/schema";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      className={`flex ${isUser ? "justify-start" : "justify-end"} animate-fade-in`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <div className="max-w-xs lg:max-w-md">
        <div 
          className={`${
            isUser 
              ? "bg-blue-600 text-white rounded-2xl rounded-tr-md" 
              : "bg-slate-100 text-slate-900 rounded-2xl rounded-tl-md"
          } px-4 py-3 shadow-sm`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Display media if present */}
          {message.messageType === 'image' && message.mediaUrl && (
            <div className="mt-3">
              <img 
                src={message.mediaUrl} 
                alt={message.mediaPrompt || "Generated image"}
                className="rounded-lg max-w-full h-auto shadow-md"
                loading="lazy"
                data-testid="message-image"
              />
              {message.mediaPrompt && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  الوصف: {message.mediaPrompt}
                </p>
              )}
            </div>
          )}
          
          {message.messageType === 'video' && message.mediaUrl && (
            <div className="mt-3">
              <video 
                src={message.mediaUrl} 
                controls
                className="rounded-lg max-w-full h-auto shadow-md"
                data-testid="message-video"
              >
                متصفحك لا يدعم عرض الفيديوهات
              </video>
              {message.mediaPrompt && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  الوصف: {message.mediaPrompt}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          {isUser ? (
            <span className="text-xs text-slate-500">أنت</span>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white text-xs"></i>
              </div>
              <span className="text-xs text-slate-500">مساعد ذكي</span>
            </div>
          )}
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
