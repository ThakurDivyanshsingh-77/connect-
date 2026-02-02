import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";       
import { useEvents } from "@/hooks/useEvents";    
import { useNetwork } from "@/hooks/useNetwork";  
import { Link } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  Trophy,
  Users,
  Target,
  Rocket,
  Award,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Star,
  Zap,
  Loader2
} from "lucide-react";

export const JuniorDashboard = () => {
  const { user } = useAuth();
  
  // --- 1. OLD HOOKS (Cards Data) ---
  const { jobs } = useJobs();
  const { events } = useEvents();
  const { users } = useNetwork();
  
  // Data Counts from Cards (Old Frontend Data)
  const acceptedConnections = users?.filter((u) => u.connectionStatus === "connected") || [];
  const connectionCount = acceptedConnections.length; // e.g., 3
  const eventsCount = events?.length || 0;            // e.g., 4
  const jobsCount = jobs?.length || 0;                // e.g., 1 (Using Job List count as 'Applied' proxy for display)

  // --- 2. BACKEND STATS STATE ---
  const [dbStats, setDbStats] = useState({
    points: 0,
    details: { certificates: 0, connections: 0, events: 0, jobs: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if(user) {
            const { data } = await axios.get(`${API_URL}/api/user/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDbStats({
                points: data.points,
                details: data.stats
            });
        }
      } catch (error) {
        console.error("Progress fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  // --- 3. CORRECT POINTS CALCULATION (As per Leaderboard Image) ---
  // Rules: Event=50, Cert=30, Job=20, Connection=10
  
  const frontendPoints = 
    (connectionCount * 10) + 
    (eventsCount * 50) +     
    (jobsCount * 20) +       
    (dbStats.details.certificates * 30); // Certificates backend se hi aayenge

  // Final Points: Jo bhi zyada ho (Backend vs Frontend Logic)
  const displayPoints = Math.max(dbStats.points, frontendPoints);
  
  // Progress Bar Logic
  const nextLevelTarget = Math.ceil((displayPoints + 1) / 100) * 100;
  const progressPercentage = Math.min((displayPoints / nextLevelTarget) * 100, 100);

  // Display Counts (Hybrid)
  const displayConnections = Math.max(dbStats.details.connections, connectionCount);
  const displayEvents = Math.max(dbStats.details.events, eventsCount);
  const displayJobs = Math.max(dbStats.details.jobs, jobsCount);

  // Quick Stats Array
  const quickStats = [
    {
      title: "Job Opportunities",
      value: displayJobs,
      icon: Briefcase,
      color: "from-blue-400 to-blue-600",
      link: "/jobs",
    },
    {
      title: "Upcoming Events",
      value: displayEvents,
      icon: Calendar,
      color: "from-purple-400 to-purple-600",
      link: "/events",
    },
    {
      title: "Connections",
      value: displayConnections,
      icon: Users,
      color: "from-green-400 to-emerald-600",
      link: "/network",
    },
    {
      title: "Current Rank",
      value: displayPoints < 100 ? "Novice" : displayPoints < 300 ? "Intermediate" : "Expert",
      icon: Trophy,
      color: "from-yellow-400 to-amber-600",
      link: "/leaderboard",
    },
  ];

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-8 text-white shadow-lg"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-8 h-8" />
            <Badge variant="secondary" className="text-sm font-medium bg-white/20 hover:bg-white/30 text-white border-0">Student Dashboard</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/80 max-w-xl">
            Track your progress: Earn 50 pts per Event, 30 pts per Certificate, and 10 pts per Connection!
          </p>
        </div>
        <div className="absolute right-8 bottom-0 opacity-10">
          <Star className="w-40 h-40" />
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border-border/50">
                <CardContent className="p-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ✅ PROGRESS SECTION (Updated Logic) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="overflow-hidden border-border/50 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                  <p className="text-sm text-muted-foreground">Based on your dashboard activity</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                {displayPoints} pts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to next level ({nextLevelTarget} pts)</span>
                  <span className="font-medium text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                {/* Progress Bar */}
                <Progress value={progressPercentage} className="h-3 bg-secondary" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="text-center p-4 rounded-xl bg-secondary/30">
                  <Award className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Certificates</p>
                  <p className="text-xl font-bold mt-1">{dbStats.details.certificates}</p>
                  <span className="text-[10px] text-muted-foreground">(30 pts/each)</span>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30">
                  <Users className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Connections</p>
                  <p className="text-xl font-bold mt-1">{displayConnections}</p>
                  <span className="text-[10px] text-muted-foreground">(10 pts/each)</span>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Events</p>
                  <p className="text-xl font-bold mt-1">{displayEvents}</p>
                  <span className="text-[10px] text-muted-foreground">(50 pts/each)</span>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30">
                  <Briefcase className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Jobs</p>
                  <p className="text-xl font-bold mt-1">{displayJobs}</p>
                  <span className="text-[10px] text-muted-foreground">(20 pts/each)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Jobs (Old Data) */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Latest Opportunities</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/jobs">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs && jobs.slice(0, 3).map((job:any) => (
                  <div key={job.id} className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{job.role}</h4>
                      <Badge variant="outline">{job.job_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">{job.location}</p>
                  </div>
              ))}
              {(!jobs || jobs.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No jobs available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/profile"><BookOpen className="w-5 h-5" /><span>Update Profile</span></Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/network"><Users className="w-5 h-5" /><span>Find Mentors</span></Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/jobs"><Briefcase className="w-5 h-5" /><span>Browse Jobs</span></Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/leaderboard"><TrendingUp className="w-5 h-5" /><span>Check Ranking</span></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};