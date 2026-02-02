import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Loader2, 
  RefreshCcw,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper to get Badge Color based on Role ---
  const getRoleBadge = (role: string) => {
    const r = role?.toLowerCase() || "";
    if (['student', 'junior'].includes(r)) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (['alumni', 'senior'].includes(r)) {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
    if (r === 'teacher') {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    if (r === 'admin') {
      return "bg-red-100 text-red-700 border-red-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading && !data) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </div>
    );
  }

  // Colors for Charts
  const COLORS = {
    students: "#3b82f6", // Blue
    alumni: "#10b981",   // Emerald
    verified: "#22c55e", // Green
    pending: "#f59e0b",  // Amber
  };

  const roleData = [
    { name: "Students/Juniors", value: data?.studentsCount || 0, color: COLORS.students },
    { name: "Alumni/Seniors", value: data?.alumniCount || 0, color: COLORS.alumni },
  ];

  const verificationData = [
    { name: "Verified", value: data?.verifiedAlumni || 0, color: COLORS.verified },
    { name: "Pending", value: data?.pendingAlumni || 0, color: COLORS.pending },
  ];

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg text-sm">
          <p className="font-semibold mb-1">{label || payload[0].name}</p>
          <p style={{ color: payload[0].fill }}>
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        
        {/* HEADER Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">Real-time insights into user growth and engagement.</p>
            </div>
            <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
            </Button>
        </div>

        {/* 1. KEY METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users Card */}
          <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{data?.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" /> Active Platform Users
              </p>
            </CardContent>
          </Card>

          {/* Students Card */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students & Juniors</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{data?.studentsCount}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${(data?.studentsCount / data?.totalUsers) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Alumni Card */}
          <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alumni & Seniors</CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{data?.alumniCount}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${(data?.alumniCount / data?.totalUsers) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Donut Chart */}
          <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Ratio of Students vs Alumni</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80} // Donut Style
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>

          {/* Rounded Bar Chart */}
          <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Verification Overview</CardTitle>
                <CardDescription>Status of Alumni Verifications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={verificationData} barSize={60}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6b7280', fontSize: 12}} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6b7280', fontSize: 12}} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}> {/* Rounded Bars */}
                        {verificationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. RECENT REGISTRATIONS TABLE */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Registrations</CardTitle>
                    <CardDescription>Newest members joining the platform</CardDescription>
                </div>
                <div className="bg-white p-2 rounded-full border shadow-sm">
                    <UserCheck className="h-5 w-5 text-gray-500" />
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.recentUsers.map((user: any) => (
                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={user.avatar} /> {/* If avatar exists */}
                                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-medium">
                                    {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentUsers || data.recentUsers.length === 0) && (
                     <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                            No recent registrations found.
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}