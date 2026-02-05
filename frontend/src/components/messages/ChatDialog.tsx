import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
}

export function ChatDialog({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  partnerAvatar,
}: ChatDialogProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(partnerId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage.trim());
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
        
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-card z-10">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              {/* FIXED: Handle Localhost Image URL */}
              <AvatarImage 
                src={partnerAvatar ? (partnerAvatar.startsWith('http') ? partnerAvatar : `https://connect-315o.onrender.com/${partnerAvatar}`) : undefined} 
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {partnerName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{partnerName}</span>
              <span className="text-xs text-muted-foreground font-normal">Active Now</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Message Area */}
        <ScrollArea className="flex-1 p-4 bg-secondary/10" ref={scrollRef}>
          {loading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground opacity-50 space-y-2">
              <Send className="h-8 w-8" />
              <p>No messages yet. Say Hi!</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg) => {
                // FIXED: MongoDB uses 'sender', not 'sender_id'
                const isOwn = msg.sender === user?.id;
                
                return (
                  <div
                    key={msg._id} // FIXED: MongoDB uses '_id'
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-card-foreground border border-border rounded-bl-none"
                      }`}
                    >
                      <p className="break-words leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 text-right opacity-70 ${
                          isOwn ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {/* FIXED: MongoDB uses 'createdAt' */}
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-3 border-t bg-card">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
              className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-primary/20"
            />
            <Button 
              onClick={handleSend} 
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="rounded-full h-10 w-10 shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 ml-0.5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}