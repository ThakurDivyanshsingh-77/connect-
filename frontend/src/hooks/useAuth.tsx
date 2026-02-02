import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { useToast } from "@/hooks/use-toast";

// 1. User Interface Definition
interface User {
  _id: string;
  id?: string; // Compatibility ke liye
  name: string;
  email: string;
  role: "junior" | "senior" | "teacher" | "admin" | string;
  isVerified: boolean;
  avatar_url?: string;
  batch?: string;
}

// 2. AuthContext Type (Includes EVERYTHING used across the app)
interface AuthContextType {
  user: User | null;
  isLoading: boolean;       // Profile.tsx uses this
  role: string | null;      // EventCard.tsx uses this
  isVerified: boolean;      // PendingVerification.tsx uses this
  
  // State Setters
  login: (token: string, userData: any) => void; // Login.tsx uses this
  logout: () => void;
  signOut: () => void;      // PendingVerification.tsx uses this (Alias for logout)
  
  // API Wrappers (Legacy Support for Signup/SignIn pages)
  signUp: (email: string, password: string, fullName: string, role: string, batch?: string, idCardFile?: File) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // --- 1. Check User on Load ---
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const { data } = await axios.get(`${API_URL}/api/auth/me`);
          setUser(data);
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  // --- 2. Core Actions ---
  
  // Login State Update (Called by Login.tsx)
  const login = (token: string, userData: any) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  // Logout Action
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/login";
  };

  // --- 3. API Actions (Legacy Support) ---

  const signUp = async (email: string, password: string, fullName: string, role: string, batch?: string, idCardFile?: File) => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", fullName);
      formData.append("role", role);
      if (batch) formData.append("batch", batch);
      if (idCardFile) formData.append("idCard", idCardFile);

      const response = await axios.post(`${API_URL}/api/auth/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { token, user } = response.data;
      login(token, user); // Reuse login logic
      
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.message || "Signup failed") };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      login(token, user); // Reuse login logic
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.message || "Login failed") };
    }
  };

  // --- 4. Derived Properties ---
  const role = user?.role || null;
  const isVerified = user?.isVerified || false;

  return (
    <AuthContext.Provider value={{
        user,
        isLoading,
        role,
        isVerified,
        login,
        logout,
        signOut: logout, // ✅ Alias: signOut call karne par logout chalega
        signUp,
        signIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};