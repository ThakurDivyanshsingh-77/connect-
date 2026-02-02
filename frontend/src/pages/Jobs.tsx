import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { PostJobDialog } from "@/components/jobs/PostJobDialog";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  Briefcase,
  Loader2,
  LogIn
} from "lucide-react";
import { Link } from "react-router-dom";

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Using the new MERN-compatible hook
  const { jobs, isLoading, isSubmitting, createJob, applyToJob, deleteJob, canPostJobs } = useJobs();
  const { user } = useAuth();

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Fix: Make comparison case-insensitive (Backend might save "Full-time")
    const matchesType = !selectedType || job.job_type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Job Opportunities
              </h1>
              <p className="text-muted-foreground">
                Exclusive job postings from verified alumni
              </p>
            </div>
            {/* Post Job Button (Only shows if authorized via useJobs hook) */}
            {canPostJobs && (
              <PostJobDialog onSubmit={createJob} isSubmitting={isSubmitting} />
            )}
          </motion.div>

          {/* Auth Notice (If not logged in) */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <p className="text-sm text-muted-foreground">
                Sign in to apply for jobs or post new opportunities
              </p>
              <Button asChild size="sm">
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </motion.div>
          )}

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search jobs by title, company, or description..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === null ? "default" : "outline"}
                  onClick={() => setSelectedType(null)}
                >
                  All
                </Button>
                <Button
                  variant={selectedType === "full-time" ? "default" : "outline"}
                  onClick={() => setSelectedType("full-time")}
                >
                  Full-time
                </Button>
                <Button
                  variant={selectedType === "internship" ? "default" : "outline"}
                  onClick={() => setSelectedType("internship")}
                >
                  Internship
                </Button>
                <Button
                  variant={selectedType === "part-time" ? "default" : "outline"}
                  onClick={() => setSelectedType("part-time")}
                >
                  Part-time
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Jobs List */}
          {!isLoading && (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onApply={applyToJob}
                  onDelete={deleteJob}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {jobs.length === 0 ? "No jobs posted yet" : "No jobs found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0
                  ? "Be the first to post a job opportunity!"
                  : "Try adjusting your search criteria"}
              </p>
              {canPostJobs && jobs.length === 0 && (
                <PostJobDialog onSubmit={createJob} isSubmitting={isSubmitting} />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;