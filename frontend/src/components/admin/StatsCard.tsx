import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  iconColor = "primary",
  delay = 0 
}: StatsCardProps) {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    admin: "bg-admin/10 text-admin",
    junior: "bg-junior/10 text-junior",
    senior: "bg-senior/10 text-senior",
    teacher: "bg-teacher/10 text-teacher",
    info: "bg-info/10 text-info",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[iconColor]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            changeType === "positive" ? "text-success" : 
            changeType === "negative" ? "text-destructive" : 
            "text-muted-foreground"
          }`}>
            {changeType === "positive" ? (
              <TrendingUp className="w-4 h-4" />
            ) : changeType === "negative" ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </motion.div>
  );
}
