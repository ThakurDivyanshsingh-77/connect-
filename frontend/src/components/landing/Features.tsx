import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Award, 
  Calendar,
  FileCheck,
  TrendingUp,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All users are verified with college ID cards ensuring authentic connections and trust.",
    gradient: "from-primary to-accent",
    shadowColor: "shadow-primary/20",
  },
  {
    icon: Users,
    title: "Open Networking",
    description: "Connect with juniors, seniors, teachers & alumni across batches without restrictions.",
    gradient: "from-junior to-primary",
    shadowColor: "shadow-junior/20",
  },
  {
    icon: Briefcase,
    title: "Job Opportunities",
    description: "Alumni post exclusive job openings. Students can apply directly through the platform.",
    gradient: "from-senior to-success",
    shadowColor: "shadow-senior/20",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Instant messaging with connections. Build relationships and seek guidance.",
    gradient: "from-info to-primary",
    shadowColor: "shadow-info/20",
  },
  {
    icon: Award,
    title: "Public Certificates",
    description: "Showcase your achievements with verified certificates visible on your public profile.",
    gradient: "from-warning to-teacher",
    shadowColor: "shadow-warning/20",
  },
  {
    icon: Calendar,
    title: "Events & Meetups",
    description: "Stay updated with college events, reunions, and networking opportunities.",
    gradient: "from-teacher to-warning",
    shadowColor: "shadow-teacher/20",
  },
  {
    icon: FileCheck,
    title: "Admin Verification",
    description: "Dedicated admin panel for ID verification ensuring platform integrity.",
    gradient: "from-admin to-destructive",
    shadowColor: "shadow-admin/20",
  },
  {
    icon: TrendingUp,
    title: "Leaderboard",
    description: "Earn points for activity. Top contributors get recognized with badges.",
    gradient: "from-success to-senior",
    shadowColor: "shadow-success/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-secondary/30 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-5 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="relative inline-block">
              <span className="text-gradient-animate bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                Build Your Network
              </span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform designed to connect students, alumni, and faculty 
            for mentorship, career growth, and lifelong professional relationships.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="h-full bg-gradient-to-br from-card via-card to-card/80 rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden">
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon */}
                <div className="relative">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadowColor} group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
                
                <h3 className="relative text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
