import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];

export interface VerificationRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  batch: string | null;
  submittedAt: string;
  idCardUrl: string;
  status: VerificationStatus;
}

export function useVerification() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch pending verification requests
      const { data: verificationData, error: verificationError } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (verificationError) throw verificationError;

      if (!verificationData || verificationData.length === 0) {
        setRequests([]);
        return;
      }

      // Get user IDs from verification requests
      const userIds = verificationData.map((v) => v.user_id);

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Fetch roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      if (rolesError) throw rolesError;

      // Create maps for quick lookup
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]));

      // Build verification requests with profile data
      const enrichedRequests: VerificationRequest[] = verificationData.map((v) => {
        const profile = profileMap.get(v.user_id);
        const role = roleMap.get(v.user_id) || "junior";

        // Calculate time ago
        const submittedDate = new Date(v.created_at);
        const now = new Date();
        const diffMs = now.getTime() - submittedDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        let submittedAt: string;
        if (diffDays > 0) {
          submittedAt = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        } else if (diffHours > 0) {
          submittedAt = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else {
          submittedAt = "Just now";
        }

        return {
          id: v.id,
          user_id: v.user_id,
          name: profile?.full_name || "Unknown User",
          email: profile?.email || "",
          role,
          batch: profile?.batch || null,
          submittedAt,
          idCardUrl: v.id_card_url,
          status: v.status,
        };
      });

      setRequests(enrichedRequests);
    } catch (error: any) {
      console.error("Error fetching verification requests:", error);
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const approveRequest = async (requestId: string, adminNotes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("verification_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("User verified successfully!");
      await fetchPendingRequests();
      return true;
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve verification");
      return false;
    }
  };

  const rejectRequest = async (requestId: string, adminNotes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("verification_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || "Verification rejected",
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Verification rejected");
      await fetchPendingRequests();
      return true;
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject verification");
      return false;
    }
  };

  const getSignedUrl = async (idCardUrl: string): Promise<string | null> => {
    try {
      // Extract the file path from the URL if it's a full URL
      let filePath = idCardUrl;
      if (idCardUrl.includes("/id-cards/")) {
        filePath = idCardUrl.split("/id-cards/").pop() || idCardUrl;
      }

      const { data, error } = await supabase.storage
        .from("id-cards")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error: any) {
      console.error("Error getting signed URL:", error);
      return null;
    }
  };

  return {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    getSignedUrl,
    refreshRequests: fetchPendingRequests,
  };
}
