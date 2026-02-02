import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Bell, Key, Trash2 } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // 1. Fetch Current Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        // User profile se settings nikalenge
        const { data } = await axios.get(`${API_URL}/api/auth/me`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        
        if (data.settings) {
            setEmailNotifs(data.settings.emailNotifications);
            setIsPublic(data.settings.profileVisibility === 'public');
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      }
    };
    fetchSettings();
  }, []);

  // 2. Handle Settings Update (Toggle)
  const handleSettingUpdate = async (type: string, value: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const payload = type === 'notification' 
        ? { emailNotifications: value }
        : { profileVisibility: value ? 'public' : 'private' };

      await axios.put(`${API_URL}/api/users/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (type === 'notification') setEmailNotifs(value);
      else setIsPublic(value);

      toast({ title: "Updated", description: "Settings saved successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update settings." });
    }
  };

  // 3. Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
        return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/users/change-password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Password changed successfully." });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.response?.data?.message || "Failed to change password." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="general">General & Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Tab 1: General & Privacy */}
          <TabsContent value="general">
            <div className="space-y-6">
                {/* Notifications Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
                        <CardDescription>Manage how we communicate with you.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive emails about new job postings and events.</p>
                        </div>
                        <Switch 
                            checked={emailNotifs}
                            onCheckedChange={(checked) => handleSettingUpdate('notification', checked)}
                        />
                    </CardContent>
                </Card>

                {/* Privacy Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Privacy</CardTitle>
                        <CardDescription>Control who can see your profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Public Profile</Label>
                            <p className="text-sm text-muted-foreground">
                                {isPublic ? "Your profile is visible to everyone in the network." : "Your profile is hidden from the network."}
                            </p>
                        </div>
                        <Switch 
                            checked={isPublic}
                            onCheckedChange={(checked) => handleSettingUpdate('privacy', checked)}
                        />
                    </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Security (Password) */}
          <TabsContent value="security">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" /> Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input 
                                type="password" 
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input 
                                    type="password" 
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <Input 
                                    type="password" 
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Update Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Danger Zone */}
          <TabsContent value="danger">
            <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5" /> Delete Account
                    </CardTitle>
                    <CardDescription>
                        Once you delete your account, there is no going back. Please be certain.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="destructive">Delete My Account</Button>
                </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}