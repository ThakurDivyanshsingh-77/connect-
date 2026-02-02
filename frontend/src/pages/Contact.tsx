import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API Call logic yahan aayega
    toast({
        title: "Message Sent!",
        description: "We'll get back to you shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* Contact Info */}
          <div>
            <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
            <p className="text-muted-foreground mb-8">
              Have questions or feedback? We'd love to hear from you. Fill out the form or reach out directly.
            </p>
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">Email Us</p>
                        <p className="text-sm text-muted-foreground">support@alumniconnect.com</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">Call Us</p>
                        <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">Visit Us</p>
                        <p className="text-sm text-muted-foreground">Tech Park, Vapi, Gujarat</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
                <CardTitle>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <Input placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <Input placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea placeholder="How can we help you?" className="min-h-[120px]" required />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Contact;