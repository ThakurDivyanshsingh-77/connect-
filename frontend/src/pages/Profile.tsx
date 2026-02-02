import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SkillsManager } from "@/components/profile/SkillsManager";
import { CertificatesManager } from "@/components/profile/CertificatesManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth(); // Auth context se user nikalo
  const navigate = useNavigate();
  
  // Local state for profile data (taaki update hone par turant reflect ho)
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Latest Profile Data
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      // Hum direct user ID se data mangwa rahe hain taaki latest mile
      const { data } = await axios.get(`${API_URL}/api/users/${user.id || (user as any)._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate, fetchProfile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
            
          {/* 1. Header Section (Avatar & Basic Info)  */}
          <ProfileHeader 
            profile={profileData} 
            role={profileData.role} 
            isVerified={profileData.isVerified}
            onAvatarUpdate={fetchProfile} // Update hone par refresh karega
          />

          {/* 2. Tabs Section */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Profile Info</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>

            {/* Tab 1: Edit Profile Form */}
            <TabsContent value="info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileForm profile={profileData} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Skills Manager */}
            <TabsContent value="skills" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillsManager 
                    skills={profileData.skills || []} 
                    userId={profileData._id} // MongoDB ID pass kar rahe hain
                    onUpdate={fetchProfile}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Certificates Manager */}
            <TabsContent value="certificates" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Certificates & Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <CertificatesManager 
                    userId={profileData._id} 
                    isVerified={profileData.isVerified}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;