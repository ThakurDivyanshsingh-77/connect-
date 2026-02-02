import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Award, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getFileUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/admin/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCertificates(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this certificate? User points will decrease.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(certificates.filter((c: any) => c._id !== id));
      toast({ title: "Deleted", description: "Certificate removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete certificate." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Award /> Manage Certificates
        </h1>
        
        {loading ? <Loader2 className="animate-spin" /> : (
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Proof</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {certificates.map((cert: any) => (
                            <TableRow key={cert._id}>
                                <TableCell className="font-medium">{cert.title}</TableCell>
                                <TableCell>
                                    <div>{cert.user?.name || "Unknown"}</div>
                                    <div className="text-xs text-muted-foreground">{cert.user?.email}</div>
                                </TableCell>
                                <TableCell>{new Date(cert.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <a href={getFileUrl(cert.file_url)} target="_blank" rel="noreferrer">
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="w-4 h-4 mr-2" /> View
                                        </Button>
                                    </a>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cert._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {certificates.length === 0 && <TableRow><TableCell colSpan={5} className="text-center p-4">No certificates found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        )}
      </main>
    </div>
  );
}