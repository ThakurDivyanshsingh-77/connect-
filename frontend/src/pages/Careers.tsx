import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin } from "lucide-react";

const openings = [
  { id: 1, role: "Frontend Developer (React)", type: "Full-time", location: "Remote" },
  { id: 2, role: "Community Manager", type: "Internship", location: "Mumbai, India" },
  { id: 3, role: "Backend Developer (Node.js)", type: "Full-time", location: "Bangalore, India" },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are looking for passionate individuals to help us build the future of student-alumni networking.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {openings.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-6 border rounded-xl bg-card hover:bg-accent/50 transition-colors">
              <div>
                <h3 className="text-lg font-bold">{job.role}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                </div>
              </div>
              <Button variant="outline">Apply Now</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Careers;