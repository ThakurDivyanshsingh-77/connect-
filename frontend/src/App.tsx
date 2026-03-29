import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages Imports
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingVerification from "./pages/PendingVerification";
import Dashboard from "./pages/Dashboard";
import Network from "./pages/Network";
import Jobs from "./pages/Jobs";
import Events from "./pages/Events";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Mentorship from "./pages/Mentorship";
import Community from "./pages/Community";
import RoomChat from "./pages/RoomChat";

// New Public Pages
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";

// Admin Pages Imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerificationQueue from "./pages/admin/VerificationQueue";
import UserManagement from "./pages/admin/UserManagement";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCertificates from "./pages/admin/AdminCertificates";
import Analytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/pending-verification"
              element={
                <ProtectedRoute>
                  <PendingVerification />
                </ProtectedRoute>
              }
            />
            
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features" element={<Features />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<CookiePolicy />} />

            {/* --- USER PROTECTED ROUTES --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireVerified>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/network"
              element={
                <ProtectedRoute requireVerified>
                  <Network />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute requireVerified>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute requireVerified>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute requireVerified>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireVerified>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireVerified>
                  <Settings />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute requireVerified>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute requireVerified>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path="/community" element={
              <ProtectedRoute requireVerified>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/community/:roomId" element={
              <ProtectedRoute requireVerified>
                <RoomChat />
              </ProtectedRoute>
            } />
            <Route
              path="/mentorship"
              element={
                <ProtectedRoute requireVerified allowedRoles={["teacher", "junior"]}>
                  <Mentorship />
                </ProtectedRoute>
              }
            />

            {/* --- ADMIN ROUTES --- */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* 👇 ANALYTICS ROUTE ADDED HERE */}
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/verification" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VerificationQueue />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/certificates" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCertificates />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
