import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Building2, 
  Clock, 
  Briefcase,
  Trash2
} from "lucide-react";
import { ApplyJobDialog } from "./ApplyJobDialog";
import { ViewApplicantsDialog } from "./ViewApplicantsDialog";
import { Job } from "@/hooks/useJobs";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JobCardProps {
  job: Job;
  index: number;
  onApply: (jobId: string, coverLetter?: string) => Promise<{ error: Error | null }>;
  onDelete: (jobId: string) => Promise<{ error: Error | null }>;
  isSubmitting: boolean;
}

export function JobCard({ job, index, onApply, onDelete, isSubmitting }: JobCardProps) {
  const { user } = useAuth();
  
  // --- FIX START: Robust Ownership Check ---
  // 1. Get current User ID safely (handles both .id and ._id)
  const currentUserId = user?.id || (user as any)?._id;

  // 2. Get Job Poster ID safely (handles if it's a string or populated object)
  const jobPosterId = typeof job.posted_by === 'object' && job.posted_by !== null
    ? (job.posted_by as any)._id 
    : job.posted_by;

  // 3. Compare them
  const isOwner = currentUserId === jobPosterId;
  // --- FIX END ---
  
  const canApply = !isOwner; 

  const getJobTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "internship": return "warning";
      case "full-time": return "success";
      case "part-time": return "secondary";
      default: return "outline";
    }
  };

  const formatJobType = (type: string) => {
    return type.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join("-");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border p-6 hover:shadow-card-hover transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Company Logo */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
          {job.company.charAt(0)}
        </div>

        {/* Job Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {job.role}
              </h3>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              </div>
            </div>
            <Badge variant={getJobTypeBadgeVariant(job.job_type)}>
              {formatJobType(job.job_type)}
            </Badge>
          </div>

          <p className="text-muted-foreground mb-4">
            {job.description}
          </p>

          {/* Job Meta */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.experience}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Posted by{" "}
              <span className="text-foreground font-medium">
                {job.poster_name}
              </span>
              {job.poster_batch && ` (Batch ${job.poster_batch})`}
            </span>
            
            <div className="flex gap-2">
              {isOwner ? (
                <>
                  {/* View Applicants Button */}
                  <ViewApplicantsDialog jobId={job.id} />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this job listing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(job.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                canApply && (
                  <ApplyJobDialog
                    jobTitle={job.role}
                    company={job.company}
                    hasApplied={job.has_applied || false}
                    onApply={(coverLetter) => onApply(job.id, coverLetter)}
                    isSubmitting={isSubmitting}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}