import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Trash2 } from "lucide-react";
import { Event } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, isPast } from "date-fns";
import { API_URL } from "@/utils/config";
import { ViewAttendeesDialog } from "./ViewAttendeesDialog"; // 👈 Import Dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventCardProps {
  event: Event;
  index: number;
  onRegister: (eventId: string) => Promise<void>;
  onUnregister: (eventId: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  isRegistering: boolean;
  isUnregistering: boolean;
}

export const EventCard = ({
  event,
  index,
  onRegister,
  onUnregister,
  onDelete,
  isRegistering,
  isUnregistering,
}: EventCardProps) => {
  const { user, role } = useAuth();

  const eventDate = parseISO(event.event_date);
  const isEventPast = isPast(eventDate);
  const isFull = event.max_participants !== null && event.registration_count >= event.max_participants;
  const currentUserId = user?.id || (user as any)?._id;
  
  // Check if current user is the creator
  const isOwner = currentUserId === event.created_by;
  
  // Permissions Logic
  const canDelete = isOwner || role === "admin" || role === "teacher";

  // Helper to get Image URL
  const getImageUrl = (path: string) => {
    if (!path) return null;
    const cleanPath = path.replace(/\\/g, "/"); 
    return `${API_URL}/${cleanPath}`;
  };

  const eventType = event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : "Event";
  
  const handleRegisterClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (event.is_registered) {
      await onUnregister(event.id);
    } else {
      await onRegister(event.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="h-48 bg-secondary/20 relative shrink-0 overflow-hidden">
        {event.image ? (
            <img 
                src={getImageUrl(event.image) || ""} 
                alt={event.title} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
        ) : (
             <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-16 h-16 text-primary/30" />
             </div>
        )}
        
        <div className="absolute top-3 right-3">
             <Badge variant={event.is_registered ? "default" : "secondary"} className="shadow-sm">
                {eventType}
             </Badge>
        </div>

        {isEventPast && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground">Event Ended</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold line-clamp-1">{event.title}</h3>
            
            {canDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive -mr-2 hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(event.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
        
        <div className="space-y-2.5 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> {format(eventDate, "EEE, MMM d, yyyy")}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary"/> {event.time || "TBD"}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> <span className="truncate">{event.location}</span></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary"/> {event.registration_count} {event.max_participants ? `/ ${event.max_participants}` : ""} registered</div>
        </div>

        <div className="mt-auto pt-4 border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {event.creator?.full_name?.charAt(0) || "U"}
                 </div>
                 <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {event.creator?.full_name || "Unknown"}
                 </span>
            </div>

            <div className="flex gap-2">
                {/* 👇 VIEW ATTENDEES BUTTON (Only for Organizer) 👇 */}
                {isOwner && (
                    <ViewAttendeesDialog eventId={event.id} />
                )}

                {/* 👇 REGISTER BUTTON (For Everyone Else) 👇 */}
                {!isOwner && !isEventPast && (
                    <Button 
                        size="sm" 
                        variant={event.is_registered ? "outline" : "default"}
                        onClick={handleRegisterClick} 
                        disabled={isRegistering || isUnregistering || (isFull && !event.is_registered)}
                        className={event.is_registered ? "border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50" : ""}
                    >
                        {isRegistering || isUnregistering ? (
                            "Processing..." 
                        ) : event.is_registered ? (
                            "Registered ✓"
                        ) : isFull ? (
                            "Full"
                        ) : (
                            "Register Now" 
                        )}
                    </Button>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};