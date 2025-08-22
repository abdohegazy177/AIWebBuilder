import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, isLoading, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcuts, setShortcuts] = useState<Array<{ id: string; title: string; text: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Load shortcuts from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setShortcuts(parsedSettings.quickShortcuts || []);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) return;

    if (trimmedMessage.length > 4000) {
      toast({
        title: "الرسالة طويلة جداً",
        description: "يرجى تقصير الرسالة إلى أقل من 4000 حرف.",
        variant: "destructive",
      });
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  };

  // Auto-focus on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleShortcutClick = (shortcutText: string) => {
    setMessage(shortcutText);
    setShowShortcuts(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Quick Shortcuts */}
        {shortcuts.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-xs text-slate-600 hover:text-slate-800"
                data-testid="button-toggle-shortcuts"
              >
                <Zap className="h-3 w-3 ml-1" />
                اختصارات سريعة
              </Button>
            </div>
            
            {showShortcuts && (
              <div className="flex flex-wrap gap-2 animate-fade-in">
                {shortcuts.map(shortcut => (
                  <Button
                    key={shortcut.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleShortcutClick(shortcut.text)}
                    className="text-xs h-8"
                    disabled={disabled || isLoading}
                    data-testid={`shortcut-${shortcut.id}`}
                  >
                    {shortcut.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              className="resize-none rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 pr-12 text-sm leading-relaxed transition-colors duration-200 min-h-[48px] max-h-32"
              rows={1}
              disabled={disabled || isLoading}
              data-testid="input-message"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-3 bottom-3 text-slate-400 hover:text-slate-600"
              disabled={disabled || isLoading}
              data-testid="button-attachment"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[48px]"
            data-testid="button-send"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            <span>مدعوم بواسطة Google Gemini</span>
          </div>
          <div className="text-xs text-slate-400">
            {message.length}/4000 حرف
          </div>
        </div>
      </div>
    </div>
  );
}
