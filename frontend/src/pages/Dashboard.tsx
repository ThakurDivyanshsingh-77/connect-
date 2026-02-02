import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { JuniorDashboard } from "@/components/dashboard/JuniorDashboard";
import { SeniorDashboard } from "@/components/dashboard/SeniorDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, role, isLoading, isVerified } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified && role !== "admin" && role !== "senior") {
    return <Navigate to="/pending-verification" replace />;
  }

  // Admin uses separate full-page dashboard
  if (role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {role === "junior" && <JuniorDashboard />}
        {role === "senior" && <SeniorDashboard />}
        {role === "teacher" && <TeacherDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
