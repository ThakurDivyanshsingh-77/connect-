import { useState, useRef } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, CheckCircle, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  email: string;
  batch: string | null;
  bio: string | null;
  skills: string[] | null;
  company: string | null;
  designation: string | null;
  avatar_url: string | null;
}

type UserRole = "junior" | "senior" | "teacher" | "admin";

interface ProfileHeaderProps {
  profile: Profile;
  role: UserRole | null;
  isVerified: boolean;
  onAvatarUpdate: () => void;
}

export function ProfileHeader({ profile, role, isVerified, onAvatarUpdate }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getAvatar = (path?: string) => {
    if (!path) return undefined;
    return path.startsWith("http") ? path : `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('image', file);

      // 📡 MERN Backend API Call
      await axios.put(`${API_URL}/api/users/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await onAvatarUpdate(); // Refresh parent

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";
  };

  const getRoleBadgeVariant = (role: UserRole | null) => {
    switch (role) {
      case "admin": return "destructive";
      case "senior": return "default";
      case "teacher": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-2xl p-8 border">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar with upload */}
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={getAvatar(profile.avatar_url || "")} alt={profile.name} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Profile info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              {role && (
                <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
                  {role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                  {role}
                </Badge>
              )}
              {isVerified ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-muted-foreground mb-2">{profile.email}</p>
          
          {(profile.designation || profile.company) && (
            <p className="text-foreground">
              {profile.designation}
              {profile.designation && profile.company && " at "}
              {profile.company && <span className="font-medium">{profile.company}</span>}
            </p>
          )}
          
          {profile.batch && (
            <p className="text-sm text-muted-foreground mt-1">Batch: {profile.batch}</p>
          )}
        </div>
      </div>
    </div>
  );
}