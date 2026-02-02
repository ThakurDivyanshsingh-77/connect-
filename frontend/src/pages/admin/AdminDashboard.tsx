import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileCheck, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Award,
  Settings,
  BarChart3 // 👈 New Icon Import
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform efficiently.</p>
          </div>
          <div className="flex gap-2">
             {/* Quick Access Button */}
             <Link to="/admin/analytics">
                <Button variant="outline" className="gap-2">
                    <BarChart3 className="w-4 h-4" /> View Reports
                </Button>
             </Link>
             <Link to="/admin/verification">
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <FileCheck className="w-4 h-4 mr-2" /> Verify Pending Users
                </Button>
             </Link>
          </div>
        </div>

        {/* 1. STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.pendingVerifications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* 2. MANAGEMENT LINKS (Quick Access) */}
        <h2 className="text-xl font-bold mb-4">Management Console</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* 👇 NEW ANALYTICS CARD ADDED HERE */}
            <Link to="/admin/analytics">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-indigo-200 bg-indigo-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" /> User Analytics
                        </CardTitle>
                        <CardDescription>View charts, graphs & growth reports</CardDescription>
                    </CardHeader>
                </Card>
            </Link>

            {/* Manage Users */}
            <Link to="/admin/users">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" /> Users
                        </CardTitle>
                        <CardDescription>View, edit, or delete users</CardDescription>
                    </CardHeader>
                </Card>
            </Link>

            {/* Verification Queue */}
            <Link to="/admin/verification">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-orange-200 bg-orange-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-orange-500" /> Verifications
                        </CardTitle>
                        <CardDescription>Approve ID cards ({stats?.pendingVerifications} pending)</CardDescription>
                    </CardHeader>
                </Card>
            </Link>

            {/* Manage Jobs */}
            <Link to="/admin/jobs">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-green-500" /> Jobs
                        </CardTitle>
                        <CardDescription>Monitor job postings</CardDescription>
                    </CardHeader>
                </Card>
            </Link>

            {/* Manage Events */}
            <Link to="/admin/events">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" /> Events
                        </CardTitle>
                        <CardDescription>Manage upcoming events</CardDescription>
                    </CardHeader>
                </Card>
            </Link>

            {/* Manage Certificates */}
            <Link to="/admin/certificates">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" /> Certificates
                        </CardTitle>
                        <CardDescription>Validate user achievements</CardDescription>
                    </CardHeader>
                </Card>
            </Link>
        </div>

        {/* 3. RECENT ACTIVITY */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Registrations</CardTitle>
                <Link to="/admin/users">
                    <Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="w-4 h-4" /></Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentUsers.map((user: any) => (
                        <div key={user._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {recentUsers.length === 0 && <p className="text-muted-foreground">No recent activity.</p>}
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}