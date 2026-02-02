import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { RoleBadge } from "@/components/ui/role-card";
import { 
  GraduationCap, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  MessageCircle, 
  LayoutDashboard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✅ Type Definition for Role
type UserRole = "junior" | "senior" | "teacher" | "admin";

// ✅ Public Links (Logged Out Users) - Added Features, About, Blog, Contact
const publicNavLinks = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/features" },
  { name: "About", path: "/about" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

// ✅ Auth Links (Logged In Users)
const authNavLinks = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Network", path: "/network" },
  { name: "Jobs", path: "/jobs" },
  { name: "Events", path: "/events" },
  { name: "Leaderboard", path: "/leaderboard" },
];

const MessagesLink = ({ isMobile = false, onClick }: { isMobile?: boolean; onClick?: () => void }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user } = useAuth();
  const isActive = location.pathname === "/messages";

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
  }, [user]);

  if (!user) return null;

  if (isMobile) {
    return (
      <Link
        to="/messages"
        onClick={onClick}
        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/messages"
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      <MessageCircle className="w-4 h-4" />
      Messages
      {unreadCount > 0 && (
        <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs ml-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Link>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const { user, role, isVerified, signOut } = useAuth();
  
  // ✅ Check if User is Admin
  const isAdmin = role === "admin";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Logo (Redirects to /admin if admin) */}
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-foreground">
              Alumni<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Connect</span>
            </span>
          </Link>

          {/* 2. Desktop Navigation (HIDDEN IF ADMIN) */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-1">
              {(user ? authNavLinks : publicNavLinks).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <MessagesLink />
            </div>
          )}

          {/* 3. Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Role Indicator Badge (Fixed Type Error with 'as UserRole') */}
                {role && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RoleBadge role={role as UserRole} showIcon className="shadow-sm" />
                  </motion.div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 px-2">
                      <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name ? getInitials(user.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2 text-left hidden lg:block">
                        <p className="text-sm font-medium">{user.name || "User"}</p>
                        {!isVerified && role !== "senior" && role !== "admin" && (
                          <Badge variant="pending" className="text-xs h-5">Pending Verification</Badge>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Admin Specific Menu */}
                    {isAdmin ? (
                       <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        {/* User Specific Menu */}
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/settings" className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {!isAdmin && ( 
             <button
             onClick={() => setIsOpen(!isOpen)}
             className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
           >
             {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
          )}
          {isAdmin && (
             <button onClick={signOut} className="md:hidden p-2 rounded-lg text-destructive">
                <LogOut className="w-6 h-6" />
             </button>
          )}
        </div>
      </div>

      {/* Mobile Menu (Hidden for Admin) */}
      {isOpen && !isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-card border-b border-border"
        >
          <div className="px-4 py-4 space-y-2">
            {(user ? authNavLinks : publicNavLinks).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <MessagesLink isMobile onClick={() => setIsOpen(false)} />
            <div className="pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{user.name}</p>
                      {/* Fixed Type Error Here Too */}
                      {role && (
                        <RoleBadge role={role as UserRole} showIcon />
                      )}
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link to="/profile">Profile</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => { signOut(); setIsOpen(false); }} className="w-full text-destructive">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}