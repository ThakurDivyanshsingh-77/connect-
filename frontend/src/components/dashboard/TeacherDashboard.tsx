import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useNetwork } from "@/hooks/useNetwork";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  PlusCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Presentation,
  FileText,
  Award,
  Clock,
  MapPin,
} from "lucide-react";

export const TeacherDashboard = () => {
  const { profile, user } = useAuth();
  const { events } = useEvents();
  const { users } = useNetwork();

  const acceptedConnections = users?.filter((u) => u.connectionStatus === "connected") || [];
  const createdEvents = events?.filter((e) => e.created_by === user?.id) || [];
  const upcomingEvents = events?.slice(0, 3) || [];

  const quickStats = [
    {
      title: "Events Created",
      value: createdEvents.length,
      icon: Calendar,
      color: "from-teacher to-amber-400",
      link: "/events",
    },
    {
      title: "Total Events",
      value: events?.length || 0,
      icon: Presentation,
      color: "from-teacher to-yellow-400",
      link: "/events",
    },
    {
      title: "Connections",
      value: acceptedConnections.length,
      icon: Users,
      color: "from-teacher to-orange-400",
      link: "/network",
    },
    {
      title: "Students Connected",
      value: acceptedConnections.length,
      icon: GraduationCap,
      color: "from-teacher to-amber-500",
      link: "/network",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header - Yellow/Amber for Teachers */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teacher via-amber-400 to-teacher p-8 text-teacher-foreground"
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8" />
            <Badge variant="teacher" className="text-sm font-medium">Teacher Dashboard</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {profile?.full_name?.split(" ")[0]}! 📚
          </h1>
          <p className="text-black/70 max-w-xl">
            Create impactful events, connect with students and alumni, and help build a thriving academic community.
          </p>
        </div>
        <div className="absolute right-8 bottom-0 opacity-20">
          <GraduationCap className="w-32 h-32" />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Event */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full bg-gradient-to-br from-teacher/10 to-amber-500/10 border-teacher/30">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teacher to-amber-400 flex items-center justify-center mb-6 shadow-lg">
                <Presentation className="w-8 h-8 text-teacher-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Create New Event</h3>
              <p className="text-muted-foreground mb-6">
                Organize workshops, seminars, guest lectures, and other academic events for students and alumni.
              </p>
              <Button className="bg-gradient-to-r from-teacher to-amber-400 hover:opacity-90 text-teacher-foreground" asChild>
                <Link to="/events">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connect */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Connect & Guide</h3>
              <p className="text-muted-foreground mb-6">
                Mentor students, collaborate with alumni, and foster meaningful academic relationships.
              </p>
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-500/10" asChild>
                <Link to="/network">
                  <Users className="w-4 h-4 mr-2" />
                  View Network
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <CardTitle>My Created Events</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {createdEvents.length > 0 ? (
              <div className="space-y-3">
                {createdEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <Badge variant="outline">
                        {event.max_participants ? `${event.max_participants} max` : "Unlimited"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>You haven't created any events yet</p>
                <Button variant="link" className="mt-2" asChild>
                  <Link to="/events">Create your first event</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Upcoming Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Presentation className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-pink-400 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/profile">
                  <FileText className="w-5 h-5" />
                  <span>Update Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/network">
                  <Users className="w-5 h-5" />
                  <span>View Network</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/messages">
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link to="/leaderboard">
                  <Award className="w-5 h-5" />
                  <span>Leaderboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
