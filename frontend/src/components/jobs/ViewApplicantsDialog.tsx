import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Loader2, MessageSquare } from "lucide-react"; // Message Icon added
import { format } from "date-fns";

interface Applicant {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar_url?: string;
    batch?: string;
  };
  appliedAt: string;
  coverLetter?: string; // Type added
}

export function ViewApplicantsDialog({ jobId }: { jobId: string }) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchApplicants();
    }
  }, [open]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data);
    } catch (error) {
      console.error("Error fetching applicants", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${API_URL}/${url}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          View Applicants
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Applicants List</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : applicants.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              No applicants yet.
            </p>
          ) : (
            applicants.map((app) => (
              <div key={app._id} className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
                {/* User Details Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getAvatarUrl(app.user.avatar_url)} />
                      <AvatarFallback>{app.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{app.user.name}</p>
                      <p className="text-xs text-muted-foreground">{app.user.email}</p>
                      {app.user.batch && (
                        <span className="text-[10px] bg-secondary px-1 rounded">Batch {app.user.batch}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(app.appliedAt), "MMM d")}
                    </p>
                  </div>
                </div>

                {/* --- MESSAGE SECTION (Ye dikhna chahiye) --- */}
                {app.coverLetter ? (
                  <div className="mt-2 bg-muted/50 p-2 rounded text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1 text-primary text-xs font-semibold">
                       <MessageSquare className="w-3 h-3" /> Message:
                    </div>
                    <p className="text-xs italic">"{app.coverLetter}"</p>
                  </div>
                ) : (
                   <p className="text-[10px] text-muted-foreground pl-12">No message provided</p>
                )}
                {/* ------------------------------------------- */}

              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}