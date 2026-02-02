import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Clock, CheckCircle2, XCircle, Home, LogOut } from "lucide-react";

const PendingVerification = () => {
  const { signOut, role, isVerified } = useAuth();

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">You're Verified!</h1>
            <p className="text-muted-foreground mb-8">
              Your account has been verified. You now have full access to all features.
            </p>
            <Button asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center animate-pulse">
            <Clock className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Verification Pending</h1>
          <p className="text-muted-foreground mb-8">
            Your {role === "junior" ? "college" : "faculty"} ID is being reviewed by our admin team. 
            You'll have full access once your account is verified.
          </p>
          
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
            <ul className="text-left space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                <span>Our admin team will review your ID card</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                <span>You'll be notified once verified</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                <span>Full platform access will be unlocked</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PendingVerification;