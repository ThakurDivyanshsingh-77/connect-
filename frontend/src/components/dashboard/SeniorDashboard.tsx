import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import { useEvents } from "@/hooks/useEvents";
import { useNetwork } from "@/hooks/useNetwork";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  Users,
  PlusCircle,
  ArrowRight,
  Award,
  MessageSquare,
  TrendingUp,
  Building2,
  UserPlus,
  Star,
  Crown,
} from "lucide-react";

export const SeniorDashboard = () => {
  const { profile, user } = useAuth();
  const { jobs } = useJobs();
  const { events } = useEvents();
  const { users } = useNetwork();

  const acceptedConnections = users?.filter((u) => u.connectionStatus === "connected") || [];
  const pendingRequests = users?.filter((u) => u.connectionStatus === "pending_received") || [];
  const postedJobs = jobs?.filter((j) => j.posted_by === user?.id) || [];
  
  const quickStats = [
    {
      title: "Jobs Posted",
      value: postedJobs.length,
      icon: Briefcase,
      color: "from-senior to-emerald-400",
      link: "/jobs",
    },
    {
      title: "Connection Requests",
      value: pendingRequests?.length || 0,
      icon: UserPlus,
      color: "from-senior to-teal-400",
      link: "/network",
    },
    {
      title: "Active Connections",
      value: acceptedConnections.length,
      icon: Users,
      color: "from-senior to-green-400",
      link: "/network",
    },
    {
      title: "Upcoming Events",
      value: events?.length || 0,
      icon: Calendar,
      color: "from-senior to-emerald-500",
      link: "/events",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header - Green for Seniors */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-senior via-emerald-500 to-senior p-8 text-senior-foreground"
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8" />
            <Badge variant="senior" className="text-sm font-medium">Alumni Dashboard</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {profile?.full_name?.split(" ")[0]}! 🌟
          </h1>
          <p className="text-white/80 max-w-xl">
            Help shape the future! Post job opportunities, mentor students, and stay connected with your alma mater.
          </p>
        </div>
        <div className="absolute right-8 bottom-0 opacity-20">
          <Award className="w-32 h-32" />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Post New Job */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full bg-gradient-to-br from-senior/5 to-emerald-500/5 border-senior/20">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-senior to-emerald-400 flex items-center justify-center mb-6 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Post a Job Opportunity</h3>
              <p className="text-muted-foreground mb-6">
                Help students and recent graduates find their dream careers by posting job openings from your company.
              </p>
              <Button className="bg-gradient-to-r from-senior to-emerald-400 hover:opacity-90" asChild>
                <Link to="/jobs">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mentorship */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full bg-gradient-to-br from-accent/5 to-pink-500/5 border-accent/20">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-pink-400 flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Connect & Mentor</h3>
              <p className="text-muted-foreground mb-6">
                Share your experience and guide students through their academic and professional journey.
              </p>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" asChild>
                <Link to="/messages">
                  <Users className="w-4 h-4 mr-2" />
                  View Messages
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Posted Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <CardTitle>My Posted Jobs</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/jobs">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {postedJobs.length > 0 ? (
              <div className="space-y-3">
                {postedJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">{job.role}</h4>
                      <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                    </div>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Closed"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>You haven't posted any jobs yet</p>
                <Button variant="link" className="mt-2" asChild>
                  <Link to="/jobs">Post your first job</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/profile">
                  <Award className="w-5 h-5" />
                  <span>Update Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/network">
                  <Users className="w-5 h-5" />
                  <span>View Network</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/events">
                  <Calendar className="w-5 h-5" />
                  <span>Browse Events</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/leaderboard">
                  <TrendingUp className="w-5 h-5" />
                  <span>Leaderboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
