import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell, Briefcase, Calendar, CheckCircle2, GraduationCap, Loader2, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { useNotifications, type NotificationItem } from "@/hooks/useNotifications";
import { getImageUrl } from "@/utils/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const typeConfig: Record<NotificationItem["type"], { icon: typeof MessageCircle; label: string; iconClass: string }> = {
  message: {
    icon: MessageCircle,
    label: "Message",
    iconClass: "text-blue-500",
  },
  connection_request: {
    icon: UserPlus,
    label: "Connection",
    iconClass: "text-emerald-500",
  },
  job_update: {
    icon: Briefcase,
    label: "Job",
    iconClass: "text-orange-500",
  },
  event_reminder: {
    icon: Calendar,
    label: "Event",
    iconClass: "text-purple-500",
  },
  verification_status: {
    icon: ShieldCheck,
    label: "Verification",
    iconClass: "text-amber-500",
  },
  mentorship_request: {
    icon: GraduationCap,
    label: "Mentorship",
    iconClass: "text-indigo-500",
  },
  mentorship_approved: {
    icon: GraduationCap,
    label: "Mentorship",
    iconClass: "text-emerald-500",
  },
  mentorship_rejected: {
    icon: GraduationCap,
    label: "Mentorship",
    iconClass: "text-rose-500",
  },
};

const getInitials = (name?: string | null) => {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function NotificationsMenu() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const latestNotifications = useMemo(
    () => notifications.slice(0, 10),
    [notifications]
  );

  const handleOpenNotification = async (notification: NotificationItem) => {
    await markAsRead(notification._id);
    navigate(notification.link || "/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-[420px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : latestNotifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            latestNotifications.map((notification) => {
              const config = typeConfig[notification.type] || {
                icon: MessageCircle,
                label: "Notification",
                iconClass: "text-muted-foreground",
              };
              const Icon = config.icon;

              return (
                <DropdownMenuItem
                  key={notification._id}
                  className="cursor-pointer items-start gap-3 px-4 py-3 focus:bg-secondary"
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleOpenNotification(notification);
                  }}
                >
                  <div className="relative mt-0.5">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={getImageUrl(notification.sender?.avatar_url)} />
                      <AvatarFallback>{getInitials(notification.sender?.name)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                      <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className={`line-clamp-1 text-sm ${notification.isRead ? "font-medium" : "font-semibold"}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
