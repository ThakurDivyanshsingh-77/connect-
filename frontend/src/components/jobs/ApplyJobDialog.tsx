import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Loader2, CheckCircle } from "lucide-react";

interface ApplyJobDialogProps {
  jobTitle: string;
  company: string;
  hasApplied: boolean;
  onApply: (coverLetter?: string) => Promise<{ error: Error | null }>;
  isSubmitting: boolean;
}

export function ApplyJobDialog({
  jobTitle,
  company,
  hasApplied,
  onApply,
  isSubmitting,
}: ApplyJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleApply = async () => {
    const { error } = await onApply(coverLetter || undefined);
    if (!error) {
      setCoverLetter("");
      setOpen(false);
    }
  };

  if (hasApplied) {
    return (
      <Button size="sm" variant="outline" disabled>
        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
        Applied
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          Apply Now
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application to {company}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell the recruiter why you're a great fit for this role..."
              className="min-h-[150px] resize-none"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              A personalized cover letter can help your application stand out
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
