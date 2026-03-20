import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";
import { API_URL } from "@/utils/config";
import { getSocket } from "@/lib/socket";

export interface NotificationItem {
  _id: string;
  type:
    | "message"
    | "connection_request"
    | "job_update"
    | "event_reminder"
    | "verification_status"
    | "mentorship_request"
    | "mentorship_approved"
    | "mentorship_rejected"
    | "room_message"
    | "room_announcement";
  title: string;
  message: string;
  link: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    avatar_url?: string | null;
    role?: string | null;
  } | null;
}

const upsertNotification = (items: NotificationItem[], incoming: NotificationItem) => {
  const existingIndex = items.findIndex((item) => item._id === incoming._id);
  if (existingIndex === -1) {
    return [incoming, ...items].slice(0, 30);
  }

  const next = [...items];
  next[existingIndex] = incoming;
  return next;
};

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id || (user as any)?._id;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Notifications fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const target = notifications.find((item) => item._id === notificationId);
    if (!target || target.isRead) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => prev.map((item) => (
        item._id === notificationId ? data.notification : item
      )));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Notification read error:", error);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => prev.map((item) => ({
        ...item,
        isRead: true,
        readAt: new Date().toISOString(),
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Notifications read-all error:", error);
    }
  }, [unreadCount, userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket(userId);

    const handleNotificationReceived = (notification: NotificationItem) => {
      setNotifications((prev) => upsertNotification(prev, notification));
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleUnreadCount = (count: number) => {
      setUnreadCount(count);
    };

    socket.on("notification received", handleNotificationReceived);
    socket.on("notification unread count", handleUnreadCount);

    return () => {
      socket.off("notification received", handleNotificationReceived);
      socket.off("notification unread count", handleUnreadCount);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
