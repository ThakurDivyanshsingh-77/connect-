import { useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ViewAttendeesDialogProps {
  eventId: string;
}

export const ViewAttendeesDialog = ({ eventId }: ViewAttendeesDialogProps) => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Helper to fix Image URL
  const getAvatar = (path?: string) => {
    if (!path) return undefined;
    const cleanPath = path.replace(/\\/g, "/");
    return cleanPath.startsWith("http") ? cleanPath : `${API_URL}/${cleanPath}`;
  };

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/events/${eventId}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendees(data);
    } catch (error) {
      console.error("Error fetching attendees", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
            setAttendees([]); // Reset old data
            fetchAttendees(); // Fetch fresh data
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
          <Users className="w-4 h-4" /> View List
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Registered Students
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-2 mt-2 space-y-1">
            {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Loading details...</p>
            </div>
            ) : attendees.length === 0 ? (
            <div className="text-center py-10 bg-secondary/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground">No students have registered yet.</p>
            </div>
            ) : (
            <div className="space-y-3">
                {attendees.map((attendee: any) => (
                <div key={attendee._id} className="flex items-center gap-3 p-3 bg-secondary/10 hover:bg-secondary/30 transition-colors rounded-lg border border-transparent hover:border-border">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={getAvatar(attendee.user?.avatar_url)} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {attendee.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{attendee.user?.name || "Unknown User"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate max-w-[120px]">{attendee.user?.field_of_study || "Student"}</span>
                            <span>•</span>
                            <span>{attendee.user?.batch || "Batch N/A"}</span>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};