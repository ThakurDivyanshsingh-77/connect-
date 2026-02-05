import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import {
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

/* 🔥 BACKEND URL */
const API_URL =
  import.meta.env.VITE_API_URL || "https://connect-315o.onrender.com";

type UserRole = "junior" | "senior" | "teacher";

const roles = [
  {
    id: "junior" as const,
    icon: GraduationCap,
    title: "Junior",
    subtitle: "Current Student",
    requiresId: true,
    description: "I'm currently studying",
  },
  {
    id: "senior" as const,
    icon: Award,
    title: "Senior",
    subtitle: "Alumni",
    requiresId: false,
    description: "I've graduated",
  },
  {
    id: "teacher" as const,
    icon: BookOpen,
    title: "Teacher",
    subtitle: "Faculty",
    requiresId: true,
    description: "I'm a faculty member",
  },
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    batch: "",
    idCard: null as File | null,
  });

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idCard: e.target.files[0] });
    }
  };

  /* ✅ FINAL FIXED SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("role", selectedRole);

      if (formData.batch) fd.append("batch", formData.batch);
      if (formData.idCard) fd.append("idCard", formData.idCard);

      const res = await axios.post(
        `${API_URL}/api/auth/signup`,
        fd,
        { withCredentials: true } // ❌ Content-Type mat do
      );

      localStorage.setItem("token", res.data.token);

      if (selectedRole === "senior") navigate("/");
      else navigate("/pending-verification");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRole = roles.find((r) => r.id === selectedRole);

  /* ⬇️ UI PURA SAME HAI */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl shadow-elevated border border-border p-8"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-12 h-0.5 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">Join AlumniConnect</h1>
                  <p className="text-muted-foreground">Select your role</p>
                </div>

                <div className="grid gap-4 mb-6">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left ${
                        selectedRole === role.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <role.icon className="w-6 h-6" />
                        <div className="flex-1">
                          <span className="font-semibold">{role.title}</span>
                          <p className="text-sm text-muted-foreground">
                            {role.subtitle}
                          </p>
                        </div>
                        {selectedRole === role.id && (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedRole}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />

                {currentRole?.requiresId && (
                  <input
                    type="file"
                    accept=".jpg,.png,.pdf"
                    onChange={handleFileChange}
                    required
                  />
                )}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;