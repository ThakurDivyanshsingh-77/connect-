import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Users, 
  Briefcase, 
  Award, 
  ArrowRight, 
  CheckCircle2,
  GraduationCap,
  Building2,
  MessageCircle,
  Sparkles,
  Star
} from "lucide-react";

const stats = [
  { label: "Active Alumni", value: "10,000+", icon: Users, gradient: "from-primary to-accent" },
  { label: "Job Postings", value: "500+", icon: Briefcase, gradient: "from-senior to-success" },
  { label: "Mentors", value: "250+", icon: Award, gradient: "from-junior to-primary" },
  { label: "Companies", value: "100+", icon: Building2, gradient: "from-teacher to-warning" },
];

const features = [
  "Connect with verified alumni worldwide",
  "Access exclusive job opportunities",
  "Get mentorship from industry experts",
  "Share & verify your achievements",
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Animated gradient orbs with enhanced floating */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl hero-float-1" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-br from-junior/15 to-senior/10 rounded-full blur-3xl hero-float-2" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-accent/10 to-primary/5 rounded-full blur-3xl hero-float-3" 
      />

      {/* Decorative floating elements with glow */}
      <div className="absolute top-40 left-20 hidden lg:block animate-float-gentle">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="animate-glow"
        >
          <Star className="w-8 h-8 text-primary opacity-40" />
        </motion.div>
      </div>
      <div className="absolute bottom-40 right-40 hidden lg:block animate-float-slow">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="animate-glow"
        >
          <Sparkles className="w-10 h-10 text-accent opacity-40" />
        </motion.div>
      </div>
      
      {/* Extra floating particles */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse-glow hidden lg:block" />
      <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-accent rounded-full animate-pulse-glow hidden lg:block" style={{ animationDelay: '-1s' }} />
      <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-primary rounded-full animate-pulse-glow hidden lg:block" style={{ animationDelay: '-0.5s' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-6 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span className="text-foreground font-medium">Trusted by 50+ Colleges</span>
              </Badge>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground leading-[1.1] mb-6">
              Connect, Grow &{" "}
              <span className="relative">
                <span className="text-gradient-animate bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                  Succeed Together
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join the most trusted alumni network platform. Connect with seniors, 
              find mentors, explore job opportunities, and build your professional legacy.
            </p>

            {/* Feature List */}
            <ul className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 text-muted-foreground group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success to-success/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-success/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                  </div>
                  <span className="group-hover:text-foreground transition-colors">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="hero" size="xl" asChild className="group shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all animate-pulse-glow">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild className="group backdrop-blur-sm animate-border-glow">
                <Link to="/network">
                  <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Explore Network
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative perspective-1000"
          >
            {/* Main Card with enhanced styling */}
            <div className="bg-gradient-to-br from-card via-card to-card/80 rounded-3xl shadow-2xl border border-border/50 p-8 backdrop-blur-xl relative overflow-hidden animate-float-gentle">
              {/* Card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              
              <div className="relative grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center p-5 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 hover:from-secondary hover:to-secondary/60 transition-all duration-300 border border-border/30 backdrop-blur-sm cursor-pointer group hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  >
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:animate-pulse-scale`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Cards with enhanced styling and pulse */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-card to-card/90 rounded-2xl shadow-2xl border border-border/50 p-4 hidden lg:flex items-center gap-3 backdrop-blur-xl hover:border-success/40 hover:shadow-[0_0_25px_hsl(var(--success)/0.3)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg shadow-success/30 animate-pulse-scale">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">New Connection!</div>
                <div className="text-xs text-muted-foreground">Rahul accepted your request</div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-glow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-ring" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-6 bg-gradient-to-br from-card to-card/90 rounded-2xl shadow-2xl border border-border/50 p-4 hidden lg:flex items-center gap-3 backdrop-blur-xl hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-scale">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Job Alert</div>
                <div className="text-xs text-muted-foreground">5 new positions match your profile</div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-ring" />
            </motion.div>

            {/* Extra floating element with glow */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-12 bg-gradient-to-br from-junior to-junior/70 rounded-full p-3 shadow-xl hidden xl:flex items-center justify-center animate-pulse-glow"
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
