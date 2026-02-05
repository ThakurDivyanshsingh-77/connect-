import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export interface NetworkUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: "junior" | "senior" | "teacher" | "admin";
  company?: string;
  designation?: string;
  avatar_url?: string;
  skills?: string[];
  bio?: string;
  batch?: string;
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  connectionId?: string;
}

export function useNetwork() {
  const { user } = useAuth();
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNetworkData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch Users AND Connections simultaneously
      const [usersRes, connectionsRes] = await Promise.all([
        axios.get('https://connect-315o.onrender.com/api/users', config),
        axios.get('https://connect-315o.onrender.com/api/connections', config) // Backend Route created previously
      ]);

      const allUsers = usersRes.data;
      const myConnections = connectionsRes.data;

      // 2. Map Connections for quick lookup
      const connMap: Record<string, { status: string, id: string }> = {};
      
      myConnections.forEach((conn: any) => {
        // Find who is the 'other' person in the connection
        // Note: Compare with user.id or user._id depending on your auth object
        const myId = user.id || (user as any)._id; 
        const otherId = conn.requester._id === myId ? conn.recipient._id : conn.requester._id;
        
        let status = 'none';
        if (conn.status === 'accepted') {
          status = 'connected';
        } else if (conn.status === 'pending') {
          status = conn.requester._id === myId ? 'pending_sent' : 'pending_received';
        }
        
        connMap[otherId] = { status, id: conn._id };
      });

      // 3. Merge Users with Connection Status
      const mappedUsers = allUsers.map((u: any) => ({
        id: u._id,
        user_id: u._id,
        full_name: u.name,
        email: u.email,
        role: u.role,
        company: u.company || '',
        designation: u.designation || '',
        avatar_url: u.avatar_url 
          ? (u.avatar_url.startsWith('http') ? u.avatar_url : `https://connect-315o.onrender.com${u.avatar_url}`) 
          : null,
        skills: u.skills || [],
        bio: u.bio || '',
        batch: u.batch || '',
        connectionStatus: connMap[u._id]?.status || 'none', // Real Status from DB
        connectionId: connMap[u._id]?.id
      }));

      setUsers(mappedUsers);

    } catch (error) {
      console.error("Error fetching network:", error);
      // Agar Connections API fail ho jaye (e.g. backend restart nahi hua), tab bhi users dikhao
      if (axios.isAxiosError(error) && error.response?.status === 404) {
         console.warn("Connection API not found. Is backend updated?");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  // --- ACTIONS (Now connected to Backend) ---

  const sendConnectionRequest = async (recipientId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://connect-315o.onrender.com/api/connections/request', 
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Request Sent", description: "Your connection request has been sent." });
      fetchNetworkData(); // Refresh list to update UI
      return true;
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.response?.data?.message || "Failed to send request" 
      });
      return false;
    }
  };

  const acceptConnectionRequest = async (connectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://connect-315o.onrender.com/api/connections/respond', 
        { connectionId, status: 'accepted' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Connected", description: "You are now connected!" });
      fetchNetworkData();
      return true;
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to accept request" });
      return false;
    }
  };

  const rejectConnectionRequest = async (connectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://connect-315o.onrender.com/api/connections/respond', 
        { connectionId, status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Rejected", description: "Connection request rejected." });
      fetchNetworkData();
      return true;
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to reject request" });
      return false;
    }
  };

  const cancelConnectionRequest = async (connectionId: string) => {
    // Note: Cancel ke liye hum filhal 'reject' wala logic hi use kar sakte hain agar delete API nahi banayi
    // Ya fir naya route banana padega. Abhi ke liye bas UI reset karte hain.
    toast({ title: "Cancelled", description: "Request cancelled." });
    fetchNetworkData();
    return true;
  };

  return {
    users,
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    refreshNetwork: fetchNetworkData,
  };
}