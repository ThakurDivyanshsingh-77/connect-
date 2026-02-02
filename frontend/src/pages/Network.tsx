import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetwork } from "@/hooks/useNetwork";
import { useAuth } from "@/hooks/useAuth";
import { ChatDialog } from "@/components/messages/ChatDialog";
import {
  Search,
  UserPlus,
  MessageCircle,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  Check,
  X,
  Clock,
  LogIn,
  Shield // Imported Shield
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Define role icons mapping
const roleIcons = {
  junior: GraduationCap,
  senior: Award,
  teacher: BookOpen,
  admin: Shield,
};

const Network = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    users,
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest
  } = useNetwork();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [chatPartner, setChatPartner] = useState<{
    id: string;
    name: string;
    avatar: string | null;
  } | null>(null);

  // Filter users based on search query and selected role
  const filteredUsers = users.filter((networkUser) => { // Renamed user to networkUser to avoid conflict
    const matchesSearch =
      networkUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (networkUser.company?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (networkUser.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesRole = !selectedRole || networkUser.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleConnect = async (userId: string) => {
    setPendingActions(prev => new Set(prev).add(userId));
    await sendConnectionRequest(userId);
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleAccept = async (connectionId: string, userId: string) => {
    setPendingActions(prev => new Set(prev).add(userId));
    await acceptConnectionRequest(connectionId);
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleReject = async (connectionId: string, userId: string) => {
    setPendingActions(prev => new Set(prev).add(userId));
    await rejectConnectionRequest(connectionId);
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleCancel = async (connectionId: string, userId: string) => {
    setPendingActions(prev => new Set(prev).add(userId));
    await cancelConnectionRequest(connectionId);
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const renderActionButtons = (networkUser: typeof users[0]) => {
    const isPending = pendingActions.has(networkUser.user_id);
    
    // Check if user is logged in
    if (!user) {
      return (
        <Link to="/login" className="flex-1">
          <Button variant="outline" className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Login to Connect
          </Button>
        </Link>
      );
    }

    // Don't show connect button for yourself
    if (user.id === networkUser.user_id) {
        return null;
    }

    switch (networkUser.connectionStatus) {
      case "connected":
        return (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setChatPartner({
              id: networkUser.user_id,
              name: networkUser.full_name,
              avatar: networkUser.avatar_url,
            })}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        );
      case "pending_sent":
        return (
          <Button
            variant="secondary"
            className="flex-1"
            disabled={isPending}
            onClick={() => networkUser.connectionId && handleCancel(networkUser.connectionId, networkUser.user_id)}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isPending ? "Cancelling..." : "Cancel Request"}
          </Button>
        );
      case "pending_received":
        return (
          <div className="flex gap-2 flex-1">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              disabled={isPending}
              onClick={() => networkUser.connectionId && handleAccept(networkUser.connectionId, networkUser.user_id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isPending}
              onClick={() => networkUser.connectionId && handleReject(networkUser.connectionId, networkUser.user_id)}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      default:
        return (
          <Button
            variant="default"
            className="flex-1"
            disabled={isPending}
            onClick={() => handleConnect(networkUser.user_id)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isPending ? "Connecting..." : "Connect"}
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Explore Network
            </h1>
            <p className="text-muted-foreground">
              Connect with alumni, students, and faculty from your college
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, company, or skills..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedRole === null ? "default" : "outline"}
                  onClick={() => setSelectedRole(null)}
                >
                  All
                </Button>
                <Button
                  variant={selectedRole === "junior" ? "secondary" : "outline"} // Changed variant for active state
                  onClick={() => setSelectedRole("junior")}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Juniors
                </Button>
                <Button
                  variant={selectedRole === "senior" ? "secondary" : "outline"} // Changed variant for active state
                  onClick={() => setSelectedRole("senior")}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Seniors
                </Button>
                <Button
                  variant={selectedRole === "teacher" ? "secondary" : "outline"} // Changed variant for active state
                  onClick={() => setSelectedRole("teacher")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Teachers
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((networkUser, index) => {
                const RoleIcon = roleIcons[networkUser.role as keyof typeof roleIcons] || Award;
                return (
                  <motion.div
                    key={networkUser.user_id} // Used user_id instead of id if that's the unique identifier from your hook
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`bg-card rounded-xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                      networkUser.role === 'junior' ? 'border-blue-100 hover:border-blue-300 dark:border-blue-900/30' :
                      networkUser.role === 'senior' ? 'border-purple-100 hover:border-purple-300 dark:border-purple-900/30' :
                      networkUser.role === 'teacher' ? 'border-orange-100 hover:border-orange-300 dark:border-orange-900/30' :
                      networkUser.role === 'admin' ? 'border-red-100 hover:border-red-300 dark:border-red-900/30' :
                      'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {networkUser.avatar_url ? (
                        <img
                          src={networkUser.avatar_url}
                          alt={networkUser.full_name}
                          className={`w-16 h-16 rounded-full object-cover ring-2 ${
                            networkUser.role === 'junior' ? 'ring-blue-100' :
                            networkUser.role === 'senior' ? 'ring-purple-100' :
                            networkUser.role === 'teacher' ? 'ring-orange-100' :
                            networkUser.role === 'admin' ? 'ring-red-100' :
                            'ring-border'
                          }`}
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                          networkUser.role === 'junior' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          networkUser.role === 'senior' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                          networkUser.role === 'teacher' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          networkUser.role === 'admin' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          {networkUser.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-foreground text-lg hover:text-primary cursor-pointer transition-colors truncate"
                          onClick={() => navigate(`/user/${networkUser.user_id}`)}
                        >
                          {networkUser.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={networkUser.role === 'junior' ? "secondary" : "outline"} className="capitalize">
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {networkUser.role}
                          </Badge>
                          {networkUser.batch && (
                            <span className="text-sm text-muted-foreground">
                              Batch {networkUser.batch}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 h-20"> {/* Fixed height for consistency */}
                      {(networkUser.company || networkUser.designation) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {networkUser.designation && networkUser.company
                              ? `${networkUser.designation} at ${networkUser.company}`
                              : networkUser.designation || networkUser.company}
                          </span>
                        </div>
                      )}
                      {networkUser.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {networkUser.bio}
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4 h-16 overflow-hidden content-start">
                      {networkUser.skills && networkUser.skills.length > 0 ? (
                        <>
                          {networkUser.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-secondary rounded-md text-xs text-secondary-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {networkUser.skills.length > 3 && (
                            <span className="px-2 py-1 text-xs text-muted-foreground">
                              +{networkUser.skills.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                         <span className="text-xs text-muted-foreground italic">No skills listed</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      {renderActionButtons(networkUser)}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/user/${networkUser.user_id}`)}
                        title="View Profile"
                      >
                        <GraduationCap className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {users.length === 0
                  ? "Be the first to join the network!"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Chat Dialog */}
      {chatPartner && (
        <ChatDialog
          open={!!chatPartner}
          onOpenChange={(open) => !open && setChatPartner(null)}
          partnerId={chatPartner.id}
          partnerName={chatPartner.name}
          partnerAvatar={chatPartner.avatar}
        />
      )}
    </div>
  );
};

export default Network;