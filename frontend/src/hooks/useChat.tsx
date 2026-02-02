import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar_url?: string };
  recipient: { _id: string; name: string; avatar_url?: string };
  content: string;
  createdAt: string;
}

export interface Conversation {
  user: { _id: string; name: string; avatar_url?: string };
  lastMessage: string;
  timestamp: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const { data } = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations", error);
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setActiveChat(userId);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load chat." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendMessage = async (recipientId: string, content: string) => {
    if (!content.trim()) return false;
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API_URL}/api/messages`, 
        { recipientId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages((prev) => [...prev, data]);
      fetchConversations(); 
      return true;
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
      return false;
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  return {
    conversations,
    messages,
    isLoading,
    activeChat,
    fetchMessages,
    sendMessage,
    fetchConversations
  };
};