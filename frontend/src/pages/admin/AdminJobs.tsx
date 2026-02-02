import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Briefcase, 
  Loader2, 
  Search, 
  MapPin, 
  Building2, 
  Calendar,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/admin/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load jobs." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // Search Logic
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = jobs.filter((job) => 
      job.title.toLowerCase().includes(lowerSearch) || 
      job.company.toLowerCase().includes(lowerSearch) ||
      job.location.toLowerCase().includes(lowerSearch)
    );
    setFilteredJobs(filtered);
  }, [search, jobs]);

  // Delete Logic
  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;
    
    // Optimistic UI Update
    const previousJobs = [...jobs];
    setJobs(jobs.filter((j) => j._id !== id));
    setFilteredJobs(filteredJobs.filter((j) => j._id !== id));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Deleted", description: "Job post removed successfully." });
    } catch (error) {
      // Revert if failed
      setJobs(previousJobs);
      setFilteredJobs(previousJobs);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete job." });
    }
  };

  const getJobTypeColor = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("full")) return "bg-blue-100 text-blue-700 hover:bg-blue-200";
    if (t.includes("part")) return "bg-orange-100 text-orange-700 hover:bg-orange-200";
    if (t.includes("remote")) return "bg-green-100 text-green-700 hover:bg-green-200";
    return "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-8 w-8 text-primary" /> Manage Jobs
                </h1>
                <p className="text-muted-foreground mt-1">Review, manage, or remove job listings.</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by title, company..."
                    className="pl-9 bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
        
        {loading ? (
           <div className="flex justify-center py-20">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : (
            <Card className="shadow-sm border-gray-200 overflow-hidden">
                <CardHeader className="bg-white border-b pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Job Listings</CardTitle>
                            <CardDescription>Total {jobs.length} active jobs found</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[30%]">Job Title</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Posted On</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job: any) => (
                                    <TableRow key={job._id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-semibold text-gray-900">{job.title}</div>
                                            <div className="text-xs text-muted-foreground md:hidden">{job.company}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {job.company}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {job.location}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`${getJobTypeColor(job.type)} border-0`}>
                                                {job.type || "Full Time"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(job._id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Briefcase className="h-12 w-12 mb-2 opacity-20" />
                                            <p>No job listings found.</p>
                                            {search && <p className="text-sm">Try adjusting your search terms.</p>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}