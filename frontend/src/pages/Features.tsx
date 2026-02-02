import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Calendar, Award, Shield, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Alumni Directory",
    description: "Search and connect with alumni based on batch, company, or location. Build your professional network effortlessly."
  },
  {
    icon: Briefcase,
    title: "Job Portal",
    description: "Exclusive job and internship opportunities posted by alumni. Get referrals and career guidance directly from seniors."
  },
  {
    icon: Calendar,
    title: "Events & Webinars",
    description: "Stay updated with college reunions, tech talks, and career workshops. Register and participate with a single click."
  },
  {
    icon: Award,
    title: "Digital Certificates",
    description: "Upload and showcase your achievements. Earn points for every certificate and climb the leaderboard."
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "A safe community where every user is verified by the admin. Trust the connections you make."
  },
  {
    icon: MessageCircle,
    title: "Mentorship",
    description: "Find mentors in your field of interest. Chat with them to get advice on career paths and skill development."
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">Platform Features</h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to bridge the gap between campus life and professional success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-primary/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;