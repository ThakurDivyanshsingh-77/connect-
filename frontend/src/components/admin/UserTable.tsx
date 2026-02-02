import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  GraduationCap,
  Award,
  BookOpen,
  Shield,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ManagedUser, UserRole } from "@/hooks/useUserManagement";

interface UserTableProps {
  users: ManagedUser[];
  onViewUser?: (user: ManagedUser) => void;
  onDeleteUser?: (user: ManagedUser) => void;
  onApproveUser?: (user: ManagedUser) => void;
  onRejectUser?: (user: ManagedUser) => void;
  onUpdateRole?: (user: ManagedUser, newRole: UserRole) => void;
}

const roleIcons = {
  junior: GraduationCap,
  senior: Award,
  teacher: BookOpen,
  admin: Shield,
};

const roleLabels: Record<UserRole, string> = {
  junior: "Junior",
  senior: "Senior",
  teacher: "Teacher",
  admin: "Admin",
};

export function UserTable({ 
  users, 
  onViewUser, 
  onDeleteUser, 
  onApproveUser, 
  onRejectUser,
  onUpdateRole 
}: UserTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<ManagedUser | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteDialog && onDeleteUser) {
      setPendingAction(deleteDialog.id);
      await onDeleteUser(deleteDialog);
      setPendingAction(null);
      setDeleteDialog(null);
    }
  };

  const handleApprove = async (user: ManagedUser) => {
    if (onApproveUser) {
      setPendingAction(user.id);
      await onApproveUser(user);
      setPendingAction(null);
    }
  };

  const handleReject = async (user: ManagedUser) => {
    if (onRejectUser) {
      setPendingAction(user.id);
      await onRejectUser(user);
      setPendingAction(null);
    }
  };

  const handleRoleChange = async (user: ManagedUser, newRole: UserRole) => {
    if (onUpdateRole && newRole !== user.role) {
      setPendingAction(user.id);
      await onUpdateRole(user, newRole);
      setPendingAction(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left font-medium text-muted-foreground py-4 px-6">User</th>
                <th className="text-left font-medium text-muted-foreground py-4 px-6">Role</th>
                <th className="text-left font-medium text-muted-foreground py-4 px-6">Status</th>
                <th className="text-left font-medium text-muted-foreground py-4 px-6">Batch</th>
                <th className="text-left font-medium text-muted-foreground py-4 px-6">Joined</th>
                <th className="text-left font-medium text-muted-foreground py-4 px-6">Last Active</th>
                <th className="text-right font-medium text-muted-foreground py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const RoleIcon = roleIcons[user.role];
                const isPending = pendingAction === user.id;
                
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.name}
                            className={`w-10 h-10 rounded-full object-cover ring-2 ${
                              user.role === 'junior' ? 'ring-junior/30' :
                              user.role === 'senior' ? 'ring-senior/30' :
                              user.role === 'teacher' ? 'ring-teacher/30' :
                              user.role === 'admin' ? 'ring-admin/30' :
                              'ring-border'
                            }`}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                            user.role === 'junior' ? 'bg-gradient-to-br from-junior to-blue-400' :
                            user.role === 'senior' ? 'bg-gradient-to-br from-senior to-emerald-400' :
                            user.role === 'teacher' ? 'bg-gradient-to-br from-teacher to-amber-400' :
                            user.role === 'admin' ? 'bg-gradient-to-br from-admin to-red-400' :
                            'bg-gradient-to-br from-primary to-accent'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={user.role} className="gap-1">
                        <RoleIcon className="w-3 h-3" />
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={user.status}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {user.batch || "—"}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{user.joinedAt}</td>
                    <td className="py-4 px-6 text-muted-foreground">{user.lastActive}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {isPending && (
                          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                        {user.status === "pending" && !isPending && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleApprove(user)}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(user)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewUser?.(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Shield className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {(Object.keys(roleLabels) as UserRole[]).map((role) => {
                                  const Icon = roleIcons[role];
                                  return (
                                    <DropdownMenuItem 
                                      key={role}
                                      onClick={() => handleRoleChange(user, role)}
                                      className={user.role === role ? "bg-secondary" : ""}
                                    >
                                      <Icon className="w-4 h-4 mr-2" />
                                      {roleLabels[role]}
                                      {user.role === role && " (current)"}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog?.name}</strong>? 
              This action cannot be undone and will remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Re-export the type for backwards compatibility
export type { ManagedUser as User } from "@/hooks/useUserManagement";
