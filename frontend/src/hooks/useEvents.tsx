import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/utils/config";

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  time: string;
  location: string;
  max_participants: number | null;
  created_by: string;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  registration_count: number;
  is_registered: boolean;
  type: string;
  image?: string; 
}

export interface CreateEventData {
  title: string;
  description: string;
  event_date: string;
  time: string;
  location: string;
  max_participants?: number | null;
  type?: string;
  image?: File | null;
}

export const useEvents = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreateEvents = role === "admin" || role === "teacher" || role === "senior";

  // 1. Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const { data } = await axios.get(`${API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("🔥 API Data Received:", data);

      const mappedEvents: Event[] = data.map((e: any) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        event_date: e.date,
        time: e.time,
        location: e.location,
        max_participants: e.max_participants || null,
        created_by: e.organizer?._id,
        created_at: e.createdAt,
        creator: {
          full_name: e.organizer?.name || "Unknown",
          avatar_url: e.organizer?.avatar_url
        },
        registration_count: e.attendees.length,
        is_registered: e.attendees.some((a: any) => a.user === user?.id),
        type: e.type,
        image: e.image 
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 2. Create Event
  const createEvent = async (eventData: CreateEventData) => {
    if (!user) return;
    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('date', eventData.event_date);
      formData.append('time', eventData.time);
      formData.append('location', eventData.location);
      formData.append('type', eventData.type || 'webinar');
      
      if (eventData.max_participants) {
        formData.append('max_participants', eventData.max_participants.toString());
      }
      
      if (eventData.image) {
        formData.append('image', eventData.image);
      }

      await axios.post(`${API_URL}/api/events`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Event created successfully!" });
      fetchEvents();
      return true;
    } catch (error: any) {
      console.error("Create Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create event" });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Register Function (FIXED & FULLY IMPLEMENTED)
  const register = async (eventId: string) => {
    console.log("🚀 Register Function Called for:", eventId); 

    if (!user) {
        console.error("❌ ERROR: User not found in useEvents!");
        toast({ variant: "destructive", title: "Error", description: "You appear to be logged out. Refresh page." });
        return;
    }

    setIsRegistering(true);

    try {
      const token = localStorage.getItem("token");
      console.log("📡 Sending Register Request...");
      
      const res = await axios.post(`${API_URL}/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ Server Response:", res.data);
      toast({ title: "Success", description: "Registered for event! (+50 Points)" });
      
      await fetchEvents(); // Update list immediately
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Failed to register";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setIsRegistering(false);
    }
  };

  // 4. Unregister Function (FIXED & FULLY IMPLEMENTED)
  const unregister = async (eventId: string) => {
    if (!user) return;
    setIsUnregistering(true);
    try {
      const token = localStorage.getItem("token");
      console.log("📡 Sending Unregister Request...");

      await axios.delete(`${API_URL}/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Unregistered from event" });
      await fetchEvents();
    } catch (error) {
      console.error("Unregister Error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to unregister" });
    } finally {
      setIsUnregistering(false);
    }
  };

  // 5. Delete Function
  const deleteEvent = async (eventId: string) => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Event deleted" });
      fetchEvents();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete" });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    canCreateEvents,
    createEvent,
    isCreating,
    register,
    isRegistering,
    unregister,
    isUnregistering,
    deleteEvent,
    isDeleting
  };
};