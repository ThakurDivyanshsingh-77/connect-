import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat"; // Ensure useChat hook exists
import { useNavigate } from "react-router-dom";

interface SendMessageDialogProps {
  recipientId: string;
  recipientName: string;
}

export const SendMessageDialog = ({ recipientId, recipientName }: SendMessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { sendMessage } = useChat();
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    
    // 1. Message Send Karen
    const success = await sendMessage(recipientId, message);
    
    setLoading(false);

    if (success) {
      setOpen(false); // Dialog band karein
      setMessage(""); // Input clear karein
      navigate("/messages"); // Chat page par le jayen
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="w-4 h-4" /> Message
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message {recipientName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder={`Say hello to ${recipientName}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading || !message.trim()}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};