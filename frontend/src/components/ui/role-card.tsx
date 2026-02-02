import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, BookOpen, Shield } from "lucide-react";

type UserRole = "junior" | "senior" | "teacher" | "admin";

const roleConfig = {
  junior: {
    label: "Student",
    icon: GraduationCap,
    gradient: "from-junior to-blue-400",
    bgGradient: "from-junior/10 to-blue-500/10",
    borderColor: "border-junior/30",
    iconBg: "bg-gradient-to-br from-junior to-blue-400",
  },
  senior: {
    label: "Alumni",
    icon: Award,
    gradient: "from-senior to-emerald-400",
    bgGradient: "from-senior/10 to-emerald-500/10",
    borderColor: "border-senior/30",
    iconBg: "bg-gradient-to-br from-senior to-emerald-400",
  },
  teacher: {
    label: "Teacher",
    icon: BookOpen,
    gradient: "from-teacher to-amber-400",
    bgGradient: "from-teacher/10 to-amber-500/10",
    borderColor: "border-teacher/30",
    iconBg: "bg-gradient-to-br from-teacher to-amber-400",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    gradient: "from-admin to-red-400",
    bgGradient: "from-admin/10 to-red-500/10",
    borderColor: "border-admin/30",
    iconBg: "bg-gradient-to-br from-admin to-red-400",
  },
};

interface RoleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  role: UserRole;
  showBadge?: boolean;
  variant?: "default" | "filled" | "minimal";
}

export function RoleCard({ 
  role, 
  showBadge = true, 
  variant = "default",
  className, 
  children, 
  ...props 
}: RoleCardProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  const variantStyles = {
    default: `bg-gradient-to-br ${config.bgGradient} ${config.borderColor}`,
    filled: `bg-gradient-to-br ${config.gradient} text-white`,
    minimal: "bg-card",
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        variantStyles[variant],
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}

interface RoleIconProps extends React.HTMLAttributes<HTMLDivElement> {
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

export function RoleIcon({ role, size = "md", className, ...props }: RoleIconProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div 
      className={cn(
        "rounded-xl flex items-center justify-center shadow-lg",
        config.iconBg,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <Icon className={cn("text-white", iconSizes[size])} />
    </div>
  );
}

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  className?: string;
}

export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={role} className={cn("gap-1", className)}>
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
}

export function getRoleConfig(role: UserRole) {
  return roleConfig[role];
}

export { roleConfig };
export type { UserRole };
