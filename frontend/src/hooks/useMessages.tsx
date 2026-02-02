import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import io, { Socket } from "socket.io-client";
import { API_URL } from "@/utils/config";

// Socket ko component ke bahar rakhein (Singleton)
var socket: Socket;

export interface Message {
  _id: string;
  sender: any; // Relaxed type to handle Object or String
  recipient: any; // Relaxed type
  content: string;
  attachment?: {
    url: string;
    type: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function useMessages(partnerId?: string) {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?._id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 1. Initialize Socket
  useEffect(() => {
    if (!userId) return;

    if (!socket) {
      socket = io(API_URL);
      socket.emit("setup", { _id: userId });
      socket.on("connected", () => console.log("Socket Connected"));
    }
  }, [userId]);

  // 2. Fetch Inbox
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (error) {
      console.error("Error conversations:", error);
    }
  }, [userId]);

  // 3. Fetch Chat History
  const fetchMessages = useCallback(async () => {
    if (!userId || !partnerId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      
      if (socket) socket.emit("join chat", partnerId);
    } catch (error) {
      console.error("Error messages:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, partnerId]);

  // 4. Listen for Messages (FULLY FIXED LOGIC)
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessage: Message) => {
      // 👇 Step 1: Sender ID nikalo (Object hai to ._id, nahi to direct string)
      let msgSenderId = newMessage.sender;
      if (newMessage.sender && typeof newMessage.sender === 'object') {
        msgSenderId = newMessage.sender._id;
      }

      // 👇 Step 2: Recipient ID nikalo (Handle Null & Object safely)
      let msgRecipientId = newMessage.recipient;
      if (newMessage.recipient && typeof newMessage.recipient === 'object') {
        msgRecipientId = newMessage.recipient._id;
      }

      // 👇 Step 3: Match Logic
      // Agar Chat Open hai, aur message current partner se ya current partner ke liye hai
      if (partnerId && (msgSenderId === partnerId || msgRecipientId === partnerId)) {
        setMessages((prev) => [...prev, newMessage]);
      }
      
      // Sidebar Update karo
      fetchConversations();
    };

    socket.off("message received");
    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [partnerId, fetchConversations]); 

  // 5. Send Message
  const sendMessage = async (content: string, attachment?: { url: string; type: string }) => {
    if (!userId || !partnerId) return false;

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        recipientId: partnerId,
        content,
        attachment
      };

      const { data } = await axios.post(`${API_URL}/api/messages`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (socket) socket.emit("new message", data);

      setMessages((prev) => [...prev, data]);
      fetchConversations();
      return true;
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send" });
      return false;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (partnerId) fetchMessages();
  }, [fetchMessages, partnerId]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    refreshMessages: fetchMessages,
    refreshConversations: fetchConversations,
  };
}