import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Bridging the Gap Between Campus & Career
          </h1>
          <p className="text-lg text-muted-foreground">
            AlumniConnect is a student-first platform designed to foster meaningful relationships between current students and successful alumni.
          </p>
        </motion.div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="bg-secondary/30 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              To empower every student with the guidance, mentorship, and opportunities they need to succeed in their professional journey by unlocking the power of their alumni network.
            </p>
          </div>
          <div className="bg-secondary/30 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground">
              A world where every college graduate enters the workforce with confidence, supported by a strong community of seniors who have walked the path before them.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
                { label: "Students", value: "5,000+" },
                { label: "Alumni", value: "1,200+" },
                { label: "Colleges", value: "50+" },
                { label: "Connections", value: "10k+" },
            ].map((stat, i) => (
                <div key={i} className="p-4 border rounded-xl">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default About;