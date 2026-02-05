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

import { API_URL } from "@/utils/config";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", selectedRole);

      if (formData.batch) {
        formDataToSend.append("batch", formData.batch);
      }

      if (formData.idCard) {
        formDataToSend.append("idCard", formData.idCard);
      }

      const response = await axios.post(
        `${API_URL}/api/auth/signup`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const { token } = response.data;
      localStorage.setItem("token", token);

      if (selectedRole === "senior") {
        navigate("/");
      } else {
        navigate("/pending-verification");
      }
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRole = roles.find((r) => r.id === selectedRole);

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
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div
                className={`w-3 h-3 rounded-full ${
                  step >= 1 ? "bg-primary" : "bg-muted"
                }`}
              />
              <div
                className={`w-12 h-0.5 ${
                  step >= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
              <div
                className={`w-3 h-3 rounded-full ${
                  step >= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">Join AlumniConnect</h1>
                  <p className="text-muted-foreground">
                    Select your role to get started
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
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
                          <div className="flex gap-2 items-center">
                            <span className="font-semibold">
                              {role.title}
                            </span>
                            <Badge>{role.subtitle}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                        {selectedRole === role.id && (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      {role.requiresId && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-warning">
                          <AlertCircle className="w-4 h-4" />
                          ID verification required
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full h-12"
                  disabled={!selectedRole}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {currentRole?.requiresId && (
                  <div>
                    <Label>Upload ID Card</Label>
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
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
