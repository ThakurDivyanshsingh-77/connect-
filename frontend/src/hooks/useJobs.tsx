import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/utils/config"; // Ensure client/src/utils/config.ts exists!

// Interface matches your UI components
export interface Job {
  id: string;
  role: string;       // Mapped from backend 'title'
  company: string;
  location: string;
  job_type: string;   // Mapped from backend 'type'
  experience: string; // Mapped from backend 'salaryRange'
  description: string;
  posted_by: string;
  created_at: string;
  poster_name?: string;
  poster_avatar?: string;
  has_applied?: boolean;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, role } = useAuth();

  // 1. Fetch Jobs
  const fetchJobs = useCallback(async () => {
    if (!user) return; // Don't fetch if not logged in
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const { data } = await axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const mappedJobs: Job[] = data.map((job: any) => ({
        id: job._id,
        role: job.title,
        company: job.company,
        location: job.location,
        job_type: job.type,
        experience: job.salaryRange || "N/A",
        description: job.description,
        posted_by: job.postedBy?._id || job.postedBy, // Handle populated or unpopulated
        created_at: job.createdAt,
        poster_name: job.postedBy?.name || "Unknown",
        poster_avatar: job.postedBy?.avatar_url,
        // Check if current user is in applicants array
        has_applied: job.applicants.some((app: any) => app.user === user.id)
      }));

      setJobs(mappedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 2. Create Job
  const createJob = async (jobData: {
    role: string;
    company: string;
    location: string;
    job_type: string;
    experience: string;
    description: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (role !== "senior" && role !== "admin") { 
       toast({ title: "Unauthorized", description: "Only seniors can post jobs.", variant: "destructive" });
       return { error: new Error("Unauthorized") };
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        title: jobData.role,
        company: jobData.company,
        location: jobData.location,
        type: jobData.job_type,
        description: jobData.description,
        salaryRange: jobData.experience 
      };

      await axios.post(`${API_URL}/api/jobs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Job posted successfully!" });
      fetchJobs(); 
      return { error: null };
    } catch (error) {
      console.error("Error creating job:", error);
      toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
      return { error: error as Error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Apply to Job (FIXED: Added coverLetter support)
  const applyToJob = async (jobId: string, coverLetter?: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      // Sending coverLetter in body
      await axios.post(`${API_URL}/api/jobs/${jobId}/apply`, 
        { coverLetter }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Applied!", description: "Application sent successfully." });
      fetchJobs(); 
      return { error: null };
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to apply.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      return { error: error as Error };
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete Job
  const deleteJob = async (jobId: string) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Deleted", description: "Job removed successfully." });
      fetchJobs();
      return { error: null };
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
      return { error: error as Error };
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    isSubmitting,
    fetchJobs,
    createJob,
    applyToJob,
    deleteJob,
    canPostJobs: role === "senior" || role === "admin",
  };
}