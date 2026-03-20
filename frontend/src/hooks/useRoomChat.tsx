import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/utils/config";
import { getSocket } from "@/lib/socket";

export interface RoomMessage {
  _id: string;
  sender: any;
  roomId: string;
  content: string;
  attachment?: {
    url: string;
    type: string;
  };
  messageType: string;
  createdAt: string;
  isPinned?: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

export function useRoomChat(roomId: string) {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?._id;
  
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const { toast } = useToast();

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomDetails(res.data);
    } catch (error) {
      console.error("Error fetching room:", error);
    }
  }, [roomId]);

  const fetchMessages = useCallback(async () => {
    if (!userId || !roomId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/messages/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Error messages:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, roomId]);

  useEffect(() => {
    if (!userId || !roomId) return;
    const socket = getSocket(userId);
    
    socket.emit("joinRoom", roomId);

    const handleReceiveMessage = (newMessage: RoomMessage) => {
      if (newMessage.roomId === roomId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleMessagePinned = ({ messageId, isPinned }: { messageId: string, isPinned: boolean }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, isPinned } : m));
    };

    const handleMessageReacted = ({ messageId, reactions }: { messageId: string, reactions: any[] }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagePinned", handleMessagePinned);
    socket.on("messageReacted", handleMessageReacted);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagePinned", handleMessagePinned);
      socket.off("messageReacted", handleMessageReacted);
    };
  }, [userId, roomId]);

  const sendMessage = async (content: string, attachment?: { url: string; type: string }, messageType: string = 'text') => {
    if (!userId || !roomId) return false;

    try {
      const token = localStorage.getItem("token");
      const payload = { roomId, content, attachment, messageType };

      const { data } = await axios.post(`${API_URL}/api/messages/room/${roomId}`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      getSocket(userId).emit("sendMessage", data);
      setMessages((prev) => [...prev, data]);
      return true;
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
      return false;
    }
  };

  const togglePin = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/messages/${messageId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error pinning message:", error);
      toast({ variant: "destructive", title: "Error", description: "Not authorized to pin" });
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/messages/${messageId}/react`, { emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  const inviteMember = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/rooms/${roomId}/invite`, { targetUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "User invited to room!" });
      fetchRoomDetails();
      return true;
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to invite user" });
      return false;
    }
  };

  useEffect(() => {
    fetchRoomDetails();
    fetchMessages();
  }, [fetchRoomDetails, fetchMessages]);

  return {
    messages,
    loading,
    roomDetails,
    sendMessage,
    togglePin,
    toggleReaction,
    inviteMember,
    refreshMessages: fetchMessages,
  };
}