import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-[0_0_20px_hsl(var(--primary)/0.4),0_0_40px_hsl(var(--primary)/0.2)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--destructive)/0.4)]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_10px_hsl(var(--primary)/0.15)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Custom variants for Alumni Connect Hub
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-[0_0_30px_hsl(var(--primary)/0.5),0_0_60px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 text-base px-8 py-6",
        heroOutline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] text-base px-8 py-6",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--success)/0.4)]",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--warning)/0.4)]",
        junior: "bg-junior text-junior-foreground hover:bg-junior/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--junior)/0.4)]",
        senior: "bg-senior text-senior-foreground hover:bg-senior/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--senior)/0.4)]",
        teacher: "bg-teacher text-teacher-foreground hover:bg-teacher/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--teacher)/0.4)]",
        admin: "bg-admin text-admin-foreground hover:bg-admin/90 shadow-sm hover:shadow-[0_0_15px_hsl(var(--admin)/0.4)]",
        gradient: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-[0_0_30px_hsl(var(--primary)/0.4),0_0_60px_hsl(var(--accent)/0.2)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
