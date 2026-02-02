import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Loader2, FileText, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationQueue() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper for Image URL
  const getFileUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  // 1. Fetch Pending Users
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching pending users", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load requests." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // 2. Approve/Reject Logic
  const handleAction = async (userId: string, status: 'approved' | 'rejected') => {
    setProcessingId(userId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/admin/verify/${userId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ 
        title: status === 'approved' ? "User Verified" : "User Rejected", 
        description: `Successfully ${status} the user.` 
      });

      // Remove from list locally (Instant UI update)
      setUsers(users.filter((u: any) => u._id !== userId));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Action failed." });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24 flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold">Verification Queue</h1>
                <p className="text-muted-foreground">Review and verify user ID cards.</p>
            </div>
            <Button variant="outline" onClick={fetchPendingUsers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
            </Button>
        </div>

        {/* Empty State */}
        {users.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 border rounded-xl bg-muted/20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending verifications at the moment.</p>
          </motion.div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user: any) => (
              <motion.div 
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border rounded-xl overflow-hidden shadow-sm"
              >
                {/* ID Card Preview Area */}
                <div className="h-48 bg-muted relative group flex items-center justify-center overflow-hidden">
                   {user.idCardUrl ? (
                     <>
                        <img 
                            src={getFileUrl(user.idCardUrl)} 
                            alt="ID Card" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Overlay with View Button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        <Eye className="w-4 h-4 mr-2" /> View Full ID
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                                    <img src={getFileUrl(user.idCardUrl)} alt="ID Full" className="w-full h-auto rounded-lg" />
                                </DialogContent>
                            </Dialog>
                        </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-2" />
                        <span>No ID Uploaded</span>
                     </div>
                   )}
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-start text-lg">
                    <span className="truncate">{user.name}</span>
                    <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'} className="capitalize">
                        {user.role}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground mb-6">
                    <p className="flex justify-between"><span>Email:</span> <span className="text-foreground">{user.email}</span></p>
                    <p className="flex justify-between"><span>Batch:</span> <span className="text-foreground">{user.batch || "N/A"}</span></p>
                    <p className="flex justify-between"><span>Field:</span> <span className="text-foreground">{user.field_of_study || "N/A"}</span></p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction(user._id, 'approved')}
                        disabled={!!processingId}
                    >
                        {processingId === user._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4 mr-2" />}
                        Approve
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleAction(user._id, 'rejected')}
                        disabled={!!processingId}
                    >
                        <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}