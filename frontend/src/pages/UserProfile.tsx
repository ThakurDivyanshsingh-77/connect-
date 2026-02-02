import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SendMessageDialog } from "@/components/chat/SendMessageDialog"; 
import { 
  ArrowLeft, Building2, GraduationCap, Award, BookOpen, 
  Calendar, Trophy, FileCheck, Users, ExternalLink, UserPlus, Check, Clock
} from "lucide-react";

interface UserProfileData {
  _id: string;
  name: string;
  email: string;
  bio: string | null;
  company: string | null;
  designation: string | null;
  batch: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  role: "junior" | "senior" | "teacher" | "admin";
  location: string | null;
  points: number;
  headline?: string;
}

interface Certificate {
  _id: string;
  title: string;
  issuing_organization: string;
  issue_date: string;
  category: string;
  file_url: string;
}

const roleIcons = {
  junior: GraduationCap,
  senior: Award,
  teacher: BookOpen,
  admin: Award,
};

const roleLabels = {
  junior: "Student",
  senior: "Alumni",
  teacher: "Faculty",
  admin: "Admin",
};

const UserProfile = () => {
  const params = useParams(); 
  const userId = params.id || params.userId; 

  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "connected" | "received">("none");

  const getFileUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // 1. Fetch Profile
        const profileRes = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // 2. Fetch Certificates
        const certsRes = await axios.get(`${API_URL}/api/users/certificates/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCertificates(certsRes.data);

        // 3. Check Connection
        const connRes = await axios.get(`${API_URL}/api/connections`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const myConnections = connRes.data;
        const existingConn = myConnections.find((c: any) => 
            c.requester._id === userId || c.recipient._id === userId
        );

        if (existingConn) {
            if (existingConn.status === 'accepted') setConnectionStatus('connected');
            else if (existingConn.status === 'pending') {
                 const myId = currentUser?.id || (currentUser as any)?._id;
                 if (existingConn.requester._id === myId) setConnectionStatus('pending');
                 else setConnectionStatus('received');
            }
        } else {
            setConnectionStatus('none');
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/connections/request`, 
        { recipientId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectionStatus("pending");
      toast({ title: "Success", description: "Connection request sent!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send request" });
    }
  };

  const isOwnProfile = (currentUser?.id === userId) || ((currentUser as any)?._id === userId);
  const RoleIcon = profile ? roleIcons[profile.role] : GraduationCap;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
           <Skeleton className="h-64 w-full rounded-xl mb-8" />
           <div className="text-center text-muted-foreground">Loading Profile...</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 text-center">
             <div className="max-w-md mx-auto p-8 border rounded-xl">
                <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                <Link to="/network"><Button>Back to Network</Button></Link>
             </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link to="/network" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Network
            </Link>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl border border-border p-8 mb-6 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-primary/5 -z-0"></div>

            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10 pt-4">
              <div className="relative">
                  <img 
                    src={getFileUrl(profile.avatar_url || "")} 
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg bg-white"
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.name}&background=random`; }}
                  />
                  <div className="absolute bottom-1 right-1 bg-background rounded-full p-1">
                      <Badge variant={profile.role === 'admin' ? "destructive" : "default"}>
                          <RoleIcon className="w-3 h-3" />
                      </Badge>
                  </div>
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                        <p className="text-lg text-muted-foreground">{profile.headline || roleLabels[profile.role]}</p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                            {(profile.designation || profile.company) && (
                                <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {profile.designation} {profile.company && `at ${profile.company}`}
                                </div>
                            )}
                            {profile.batch && (
                                <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> Batch {profile.batch}
                                </div>
                            )}
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" /> {profile.location}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2 md:mt-0 w-full md:w-auto">
                        {isOwnProfile ? (
                            <Link to="/profile" className="w-full md:w-auto">
                                <Button variant="outline" className="w-full">Edit Profile</Button>
                            </Link>
                        ) : (
                            <>
                                {connectionStatus === "connected" ? (
                                    <Button variant="outline" className="text-green-600 border-green-200 bg-green-50" disabled>
                                        <Check className="w-4 h-4 mr-2" /> Connected
                                    </Button>
                                ) : connectionStatus === "pending" ? (
                                    <Button variant="secondary" disabled>
                                        <Clock className="w-4 h-4 mr-2" /> Pending
                                    </Button>
                                ) : connectionStatus === "received" ? (
                                    <Link to="/network"><Button>Respond</Button></Link>
                                ) : (
                                    <Button onClick={handleConnect}>
                                        <UserPlus className="w-4 h-4 mr-2" /> Connect
                                    </Button>
                                )}
                                <SendMessageDialog recipientId={profile._id} recipientName={profile.name} />
                            </>
                        )}
                    </div>
                </div>
                {profile.bio && (
                  <p className="mt-6 text-foreground/80 leading-relaxed bg-secondary/20 p-4 rounded-lg text-sm">{profile.bio}</p>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
                </h3>
                <div className="text-center py-4 bg-primary/5 rounded-lg mb-4">
                    <div className="text-4xl font-bold text-primary">{profile.points || 0}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Points</div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Skills</h3>
                {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => <Badge key={skill} variant="secondary" className="px-3 py-1">{skill}</Badge>)}
                    </div>
                ) : <p className="text-sm text-muted-foreground">No skills added.</p>}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                <FileCheck className="w-5 h-5 text-primary" /> Certificates & Awards
              </h3>
              {certificates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
                  <p className="text-muted-foreground font-medium">No certificates uploaded yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {certificates.map((cert) => (
                    <div key={cert._id} className="flex items-center justify-between p-4 bg-card hover:bg-accent/50 border rounded-xl transition-all">
                      <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Award className="w-6 h-6" /></div>
                          <div>
                            <h4 className="font-semibold">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                          </div>
                      </div>
                      <a href={getFileUrl(cert.file_url)} target="_blank" rel="noopener noreferrer">
                         <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;