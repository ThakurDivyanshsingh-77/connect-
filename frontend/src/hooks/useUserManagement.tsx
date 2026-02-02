import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "junior" | "senior" | "teacher" | "admin";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface ManagedUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  status: VerificationStatus;
  batch?: string;
  joinedAt: string;
  lastActive: string;
  avatar_url?: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch all verification requests
      const { data: verifications, error: verificationsError } = await supabase
        .from("verification_requests")
        .select("*");

      if (verificationsError) throw verificationsError;

      // Create a map for quick lookups
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      const verificationsMap = new Map(verifications?.map(v => [v.user_id, v.status]) || []);

      // Map profiles to managed users
      const managedUsers: ManagedUser[] = (profiles || []).map((profile) => {
        const role = rolesMap.get(profile.user_id) as UserRole || "junior";
        
        // Determine status based on role and verification
        let status: VerificationStatus = "approved";
        if (role === "senior" || role === "admin") {
          status = "approved";
        } else {
          const verificationStatus = verificationsMap.get(profile.user_id);
          status = (verificationStatus as VerificationStatus) || "pending";
        }

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.full_name,
          email: profile.email,
          role,
          status,
          batch: profile.batch || undefined,
          joinedAt: new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          lastActive: formatLastActive(profile.updated_at),
          avatar_url: profile.avatar_url || undefined,
        };
      });

      setUsers(managedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));

      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("verification_requests")
        .update({ 
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, status: "approved" } : u
      ));

      toast.success("User approved successfully");
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("verification_requests")
        .update({ 
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, status: "rejected" } : u
      ));

      toast.error("User rejected");
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete profile (this will cascade due to RLS)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Delete user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Delete verification request if exists
      await supabase
        .from("verification_requests")
        .delete()
        .eq("user_id", userId);

      // Update local state
      setUsers(prev => prev.filter(u => u.user_id !== userId));

      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. You may not have permission.");
    }
  };

  const roleCounts = {
    junior: users.filter(u => u.role === "junior").length,
    senior: users.filter(u => u.role === "senior").length,
    teacher: users.filter(u => u.role === "teacher").length,
    admin: users.filter(u => u.role === "admin").length,
  };

  return {
    users,
    isLoading,
    roleCounts,
    fetchUsers,
    updateUserRole,
    approveUser,
    rejectUser,
    deleteUser,
  };
}

function formatLastActive(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
