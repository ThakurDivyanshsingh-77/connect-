import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Github, Linkedin, Twitter, Mail, Heart, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Network", href: "/network" },
    { name: "Jobs", href: "/jobs" },
    { name: "Events", href: "/events" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/ThakurDivyanshsingh-77", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/divyansh-singh-1162bb333/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/singhDivyansh77", label: "Twitter" },
 { 
  icon: Mail, 
  href: "mailto:divyanshthakur.2251@gmail.com", 
  label: "Email"  
},
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-card via-card to-card/95 border-t border-border overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl transition-shadow"
              >
                <GraduationCap className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-foreground">
                Alumni<span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Connect</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
              The trusted platform connecting students, alumni, and faculty 
              for mentorship, career growth, and lifelong professional relationships.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:from-primary/20 hover:to-accent/10 transition-all duration-300 border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-5 text-lg">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-5 text-lg">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-5 text-lg">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AlumniConnect. All rights reserved.
          </p>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm text-muted-foreground flex items-center gap-1.5"
          >
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive animate-pulse" /> for college communities
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
