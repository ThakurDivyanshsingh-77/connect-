import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Crown
} from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "Junior",
    subtitle: "Current Student",
    badge: "junior" as const,
    gradient: "from-junior to-primary",
    bgGradient: "from-junior/10 to-junior/5",
    description: "Currently studying in college? Join to connect with seniors, find mentors, and kickstart your career.",
    features: [
      "Connect with alumni worldwide",
      "Apply for exclusive job opportunities",
      "Get mentorship from seniors",
      "Upload & showcase certificates",
    ],
    verification: "College ID required",
    cta: "Join as Junior",
    popular: false,
  },
  {
    icon: Award,
    title: "Senior",
    subtitle: "Alumni / Pass-out",
    badge: "senior" as const,
    gradient: "from-senior to-success",
    bgGradient: "from-senior/10 to-senior/5",
    description: "Graduated and ready to give back? Share opportunities, mentor students, and expand your network.",
    features: [
      "Post job openings",
      "Mentor current students",
      "Reconnect with batchmates",
      "No verification needed",
    ],
    verification: "Instant access",
    cta: "Join as Senior",
    popular: true,
  },
  {
    icon: BookOpen,
    title: "Teacher",
    subtitle: "Faculty / Mentor",
    badge: "teacher" as const,
    gradient: "from-teacher to-warning",
    bgGradient: "from-teacher/10 to-teacher/5",
    description: "Faculty member? Create events, guide students, and stay connected with your alumni network.",
    features: [
      "Create & manage events",
      "Mentor students directly",
      "Connect with alumni",
      "Official faculty badge",
    ],
    verification: "Faculty ID required",
    cta: "Join as Teacher",
    popular: false,
  },
  {
    icon: Shield,
    title: "Admin",
    subtitle: "Platform Manager",
    badge: "admin" as const,
    gradient: "from-admin to-destructive",
    bgGradient: "from-admin/10 to-admin/5",
    description: "Full control over the platform. Verify users, manage content, and ensure platform integrity.",
    features: [
      "Verify user identities",
      "Manage all users & content",
      "Platform analytics",
      "Full access control",
    ],
    verification: "By invitation only",
    cta: "Admin Login",
    popular: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function RoleSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 -left-40 w-80 h-80 border border-primary/10 rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 -right-40 w-96 h-96 border border-accent/10 rounded-full"
      />
      
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
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Choose Your Path</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your{" "}
            <span className="relative inline-block">
              <span className="text-gradient-animate bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]">
                Role
              </span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join as a student, alumni, or faculty. Each role has unique capabilities 
            designed to maximize your networking experience.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {roles.map((role) => (
            <motion.div
              key={role.title}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Popular badge */}
              {role.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-senior to-success text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`h-full bg-gradient-to-br from-card via-card to-card/80 rounded-3xl p-6 border-2 ${role.popular ? 'border-senior/50' : 'border-border/50'} hover:border-primary/40 transition-all duration-500 overflow-hidden relative`}>
                {/* Card inner gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <role.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{role.title}</h3>
                      <p className="text-xs text-muted-foreground">{role.subtitle}</p>
                    </div>
                  </div>

                  <Badge variant={role.badge} className="mb-4 shadow-sm">
                    {role.verification}
                  </Badge>

                  <p className="text-sm text-muted-foreground mb-5 min-h-[72px] leading-relaxed">
                    {role.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {role.features.map((feature, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <Button 
                    variant={role.badge} 
                    className="w-full shadow-lg group-hover:shadow-xl transition-all"
                    asChild
                  >
                    <Link to="/signup">
                      {role.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
