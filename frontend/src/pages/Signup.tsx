import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Added Axios for Backend Call
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
// import { useAuth } from "@/hooks/useAuth"; // Removed to avoid Supabase conflict
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
  Loader2
} from "lucide-react";

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

  // const { signUp } = useAuth(); // Removed Supabase Hook
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idCard: e.target.files[0] });
    }
  };

  // --- UPDATED SUBMIT LOGIC FOR MERN BACKEND ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Create FormData for File Upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", selectedRole);
      
      if (formData.batch) {
        formDataToSend.append("batch", formData.batch);
      }
      
      // Important: Backend expects field name 'idCard'
      if (formData.idCard) {
        formDataToSend.append("idCard", formData.idCard);
      }

      // 2. Call Backend API
      const response = await axios.post("/api/auth/signup", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Save Token & Redirect
      const { token } = response.data;
      localStorage.setItem("token", token); // Save JWT Token

      // Redirect Logic
      if (selectedRole === "senior") {
        navigate("/"); // Seniors are auto-verified
      } else {
        navigate("/pending-verification"); // Juniors/Teachers need approval
      }

    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRole = roles.find(r => r.id === selectedRole);

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
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Join AlumniConnect</h1>
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
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedRole === role.id
                          ? `border-${role.id} bg-${role.id}/5`
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-${role.id}/10 flex items-center justify-center`}>
                          <role.icon className={`w-6 h-6 text-${role.id}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{role.title}</span>
                            <Badge variant={role.id} className="text-xs">
                              {role.subtitle}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        {selectedRole === role.id && (
                          <CheckCircle2 className={`w-6 h-6 text-${role.id}`} />
                        )}
                      </div>
                      {role.requiresId && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-warning">
                          <AlertCircle className="w-4 h-4" />
                          ID verification required
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => selectedRole && setStep(2)}
                  disabled={!selectedRole}
                  className="w-full h-12"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Details Form */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      Create Your Account
                    </h1>
                    {currentRole && (
                      <Badge variant={currentRole.id}>{currentRole.title}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    Fill in your details to complete registration
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10 h-12"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch / Year</Label>
                    <Input
                      id="batch"
                      type="text"
                      placeholder="e.g., 2024"
                      className="h-12"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        className="pl-10 pr-10 h-12"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* ID Upload for Junior & Teacher */}
                  {currentRole?.requiresId && (
                    <div className="space-y-2">
                      <Label htmlFor="idCard">
                        Upload {currentRole.id === 'junior' ? 'College' : 'Faculty'} ID Card *
                      </Label>
                      <div className="relative">
                        <label
                          htmlFor="idCard"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        >
                          {formData.idCard ? (
                            <div className="flex items-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium">{formData.idCard.name}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">
                                Click to upload ID card (JPG, PNG, PDF)
                              </span>
                            </>
                          )}
                        </label>
                        <input
                          id="idCard"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={handleFileChange}
                          required={currentRole?.requiresId}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your ID will be verified by admin before you can access all features.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12"
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;