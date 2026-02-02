import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Download, RefreshCw, GraduationCap, Award, BookOpen, Shield, 
  MoreHorizontal, Trash2, Loader2, CheckCircle2, Clock, Briefcase, UserCog
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // 1. Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch users." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Normalize roles for filtering (e.g. 'student' matches 'junior')
    let normalizedRole = user.role?.toLowerCase();
    if (normalizedRole === 'student') normalizedRole = 'junior';
    if (normalizedRole === 'alumni') normalizedRole = 'senior';

    const matchesRole = !roleFilter || normalizedRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate Counts
  const roleCounts = {
    junior: users.filter(u => ['junior', 'student'].includes(u.role?.toLowerCase())).length,
    senior: users.filter(u => ['senior', 'alumni'].includes(u.role?.toLowerCase())).length,
    teacher: users.filter(u => u.role?.toLowerCase() === 'teacher').length,
    admin: users.filter(u => u.role?.toLowerCase() === 'admin').length,
  };

  // 3. Actions
  const handleDelete = async (userId: string) => {
    if(!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
      toast({ title: "Deleted", description: "User removed successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update role." });
    }
  };

  const handleExport = () => {
    const headers = ["Name,Email,Role,Status,Joined Date"];
    const rows = filteredUsers.map(u => 
      `${u.name},${u.email},${u.role},${u.isVerified ? 'Verified' : 'Pending'},${new Date(u.createdAt).toLocaleDateString()}`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
  };

  // Helper for Badge Colors
  const getRoleBadgeStyle = (role: string) => {
    const r = role?.toLowerCase() || "";
    if (['admin'].includes(r)) return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    if (['teacher'].includes(r)) return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200";
    if (['senior', 'alumni'].includes(r)) return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
    if (['junior', 'student'].includes(r)) return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <UserCog className="h-8 w-8 text-primary" /> User Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage accounts, roles, and platform access permissions.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
        </div>

        {/* Stats / Filters Card */}
        <Card className="mb-6 border-none shadow-sm bg-white">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Role Filters */}
                    <div className="flex flex-wrap gap-2">
                        <Badge 
                            variant={roleFilter === null ? "default" : "outline"} 
                            className="cursor-pointer px-3 py-1.5 h-8 text-sm font-normal" 
                            onClick={() => setRoleFilter(null)}
                        >
                            All ({users.length})
                        </Badge>
                        <Badge 
                            variant={roleFilter === "junior" ? "default" : "outline"} 
                            className="cursor-pointer px-3 py-1.5 h-8 gap-1.5 text-sm font-normal border-blue-200 data-[state=active]:bg-blue-600"
                            onClick={() => setRoleFilter(roleFilter === "junior" ? null : "junior")}
                        >
                            <GraduationCap className="w-3.5 h-3.5" /> Juniors ({roleCounts.junior})
                        </Badge>
                        <Badge 
                            variant={roleFilter === "senior" ? "default" : "outline"} 
                            className="cursor-pointer px-3 py-1.5 h-8 gap-1.5 text-sm font-normal border-emerald-200"
                            onClick={() => setRoleFilter(roleFilter === "senior" ? null : "senior")}
                        >
                            <Briefcase className="w-3.5 h-3.5" /> Seniors ({roleCounts.senior})
                        </Badge>
                        <Badge 
                            variant={roleFilter === "teacher" ? "default" : "outline"} 
                            className="cursor-pointer px-3 py-1.5 h-8 gap-1.5 text-sm font-normal border-purple-200"
                            onClick={() => setRoleFilter(roleFilter === "teacher" ? null : "teacher")}
                        >
                            <BookOpen className="w-3.5 h-3.5" /> Teachers ({roleCounts.teacher})
                        </Badge>
                        <Badge 
                            variant={roleFilter === "admin" ? "default" : "outline"} 
                            className="cursor-pointer px-3 py-1.5 h-8 gap-1.5 text-sm font-normal border-red-200"
                            onClick={() => setRoleFilter(roleFilter === "admin" ? null : "admin")}
                        >
                            <Shield className="w-3.5 h-3.5" /> Admins ({roleCounts.admin})
                        </Badge>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            className="pl-9 h-9 bg-gray-50 border-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Users Table */}
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[300px]">User Profile</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                         <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                                    <span className="text-muted-foreground">Loading user data...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border bg-gray-100">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="text-gray-500 font-medium">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`capitalize font-medium border ${getRoleBadgeStyle(user.role)}`}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.isVerified ? (
                                        <div className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 w-fit px-2 py-1 rounded-full border border-emerald-100">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-amber-600 text-xs font-medium bg-amber-50 w-fit px-2 py-1 rounded-full border border-amber-100">
                                            <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            
                                            {/* 👇 "Make Senior" Option Added Here */}
                                            <DropdownMenuItem onClick={() => handleUpdateRole(user._id, 'senior')}>
                                                <Briefcase className="w-4 h-4 mr-2 text-emerald-600" /> Make Senior
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => handleUpdateRole(user._id, 'junior')}>
                                                <GraduationCap className="w-4 h-4 mr-2 text-blue-600" /> Make Junior
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => handleUpdateRole(user._id, 'teacher')}>
                                                <BookOpen className="w-4 h-4 mr-2 text-purple-600" /> Make Teacher
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuItem onClick={() => handleUpdateRole(user._id, 'admin')}>
                                                <Shield className="w-4 h-4 mr-2 text-red-600" /> Make Admin
                                            </DropdownMenuItem>
                                            
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(user._id)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                                    <Search className="h-8 w-8 opacity-20" />
                                    <p>No users found matching "{searchQuery}"</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

      </main>
    </div>
  );
}