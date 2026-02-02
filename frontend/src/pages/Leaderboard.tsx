import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { 
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Calendar,
  Users,
  FileCheck
} from "lucide-react";

const pointsBreakdown = [
  { activity: "Event Participation", points: "+50", icon: Calendar },
  { activity: "Certificate Upload", points: "+30", icon: FileCheck },
  { activity: "Job Posting", points: "+100", icon: Briefcase },
  { activity: "Job Application", points: "+20", icon: TrendingUp },
  { activity: "Connection Accepted", points: "+10", icon: Users },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  }
};

const getBadgeCount = (points: number): number => {
  if (points >= 3000) return 8;
  if (points >= 2500) return 7;
  if (points >= 2000) return 6;
  if (points >= 1500) return 5;
  if (points >= 1000) return 4;
  if (points >= 500) return 3;
  if (points >= 200) return 2;
  if (points >= 50) return 1;
  return 0;
};

const LeaderboardSkeleton = () => (
  <div className="divide-y divide-border">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ type }: { type: "junior" | "senior" }) => (
  <div className="p-8 text-center text-muted-foreground">
    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
    <p>No {type === "junior" ? "students" : "alumni"} on the leaderboard yet.</p>
    <p className="text-sm mt-1">Start earning points by participating in activities!</p>
  </div>
);

const Leaderboard = () => {
  const navigate = useNavigate();
  const { juniorLeaderboard, seniorLeaderboard, isLoading } = useLeaderboard();

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
            className="text-center mb-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Top contributors in our alumni community
            </p>
          </motion.div>

          {/* Points System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              How to Earn Points
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {pointsBreakdown.map((item) => (
                <div key={item.activity} className="text-center p-4 rounded-lg bg-secondary/50">
                  <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium text-foreground mb-1">{item.activity}</div>
                  <div className="text-success font-bold">{item.points}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Leaderboards Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Junior Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-junior/5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-junior" />
                  <h2 className="text-xl font-semibold text-foreground">Junior Leaderboard</h2>
                  <Badge variant="junior">Students</Badge>
                </div>
              </div>

              {isLoading ? (
                <LeaderboardSkeleton />
              ) : juniorLeaderboard.length === 0 ? (
                <EmptyState type="junior" />
              ) : (
                <div className="divide-y divide-border">
                  {juniorLeaderboard.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className={`flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors ${
                        user.rank <= 3 ? 'bg-junior/5' : ''
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-junior/20 to-junior/40 flex items-center justify-center text-lg font-bold text-junior">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-medium text-foreground truncate hover:text-primary cursor-pointer transition-colors"
                          onClick={() => navigate(`/user/${user.userId}`)}
                        >
                          {user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.department || "Student"} {user.batch && `• Batch ${user.batch}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">{user.totalPoints.toLocaleString()}</div>
                        <div className="flex items-center gap-1 justify-end">
                          {Array.from({ length: Math.min(getBadgeCount(user.totalPoints), 5) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Senior Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-senior/5">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-senior" />
                  <h2 className="text-xl font-semibold text-foreground">Senior Leaderboard</h2>
                  <Badge variant="senior">Alumni</Badge>
                </div>
              </div>

              {isLoading ? (
                <LeaderboardSkeleton />
              ) : seniorLeaderboard.length === 0 ? (
                <EmptyState type="senior" />
              ) : (
                <div className="divide-y divide-border">
                  {seniorLeaderboard.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className={`flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors ${
                        user.rank <= 3 ? 'bg-senior/5' : ''
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-senior/20 to-senior/40 flex items-center justify-center text-lg font-bold text-senior">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-medium text-foreground truncate hover:text-primary cursor-pointer transition-colors"
                          onClick={() => navigate(`/user/${user.userId}`)}
                        >
                          {user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.company || "Alumni"} {user.batch && `• Batch ${user.batch}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">{user.totalPoints.toLocaleString()}</div>
                        <div className="flex items-center gap-1 justify-end">
                          {Array.from({ length: Math.min(getBadgeCount(user.totalPoints), 5) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
