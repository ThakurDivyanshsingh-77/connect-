import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Upload, Loader2, FileText, Trash2, ExternalLink, Award, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Certificate {
  _id: string;
  title: string;
  category: string;
  issuing_organization: string;
  issue_date: string;
  file_url: string;
}

interface CertificatesManagerProps {
  userId: string;
  isVerified: boolean;
}

const CERTIFICATE_CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

export function CertificatesManager({ userId, isVerified }: CertificatesManagerProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  // Helper for Image URL
  const getFileUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token");
      // GET request to fetch user's certificates
      const { data } = await axios.get(`${API_URL}/api/users/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Max 5MB allowed." });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!title || !issuingOrganization || !issueDate || !selectedFile) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill all details and select a file." });
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('issuing_organization', issuingOrganization);
      formData.append('issue_date', issueDate);

      // POST request to upload certificate
      await axios.post(`${API_URL}/api/users/certificates`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Certificate added! (+30 Points)" });
      
      // Reset Form & Refresh List
      setTitle("");
      setIssuingOrganization("");
      setIssueDate("");
      setSelectedFile(null);
      setIsDialogOpen(false);
      fetchCertificates();
      
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Upload failed." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      // DELETE request
      await axios.delete(`${API_URL}/api/users/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Deleted", description: "Certificate removed." });
      fetchCertificates();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Delete failed." });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Upload your achievements (+30 Points each)</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Certificate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Certificate</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. AWS Certified" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input placeholder="e.g. Google" value={issuingOrganization} onChange={(e) => setIssuingOrganization(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>File (PDF/Image)</Label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                >
                    {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm truncate">{selectedFile.name}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload</span>
                        </div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf" className="hidden" />
              </div>
              <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                {isUploading ? <Loader2 className="animate-spin" /> : "Upload & Earn Points"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((cert) => (
          <div key={cert._id} className="border rounded-lg p-4 bg-card flex gap-3 hover:shadow-md transition-all">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Award className="w-4 h-4 text-primary" />
                 <h4 className="font-medium truncate">{cert.title}</h4>
               </div>
               <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
               <div className="flex gap-2 mt-2">
                 <Badge variant="secondary">{cert.category}</Badge>
                 <span className="text-xs text-muted-foreground mt-1">{format(new Date(cert.issue_date), "MMM yyyy")}</span>
               </div>
            </div>
            <div className="flex flex-col gap-2">
               <Button size="icon" variant="ghost" asChild>
                 <a href={getFileUrl(cert.file_url)} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
               </Button>
               <Button size="icon" variant="ghost" onClick={() => handleDelete(cert._id)} disabled={deletingId === cert._id}>
                 {deletingId === cert._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
               </Button>
            </div>
          </div>
        ))}
        {certificates.length === 0 && (
            <div className="col-span-2 text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No certificates added yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}