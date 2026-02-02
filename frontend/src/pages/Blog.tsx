import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "How to Ace Your First Internship Interview",
    excerpt: "Tips and tricks from alumni who have been there and done that.",
    date: "Jan 24, 2026",
    author: "Rahul Sharma",
    category: "Career Advice"
  },
  {
    id: 2,
    title: "The Power of Networking in College",
    excerpt: "Why building connections early matters more than your GPA.",
    date: "Jan 20, 2026",
    author: "Priya Singh",
    category: "Networking"
  },
  {
    id: 3,
    title: "Top 5 Skills Tech Companies Look For",
    excerpt: "A guide to the most in-demand skills in the 2026 job market.",
    date: "Jan 15, 2026",
    author: "Amit Patel",
    category: "Industry Trends"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8 text-center">Latest from Our Blog</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-48 bg-muted rounded-t-xl flex items-center justify-center text-muted-foreground">
                [Image Placeholder]
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4" /> {post.author}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;