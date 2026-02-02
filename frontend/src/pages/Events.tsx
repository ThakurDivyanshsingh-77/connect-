import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Sparkles } from "lucide-react";

const Events = () => {
  const {
    events,
    isLoading,
    canCreateEvents,
    createEvent,
    isCreating,
    register,         // ✅ Connected
    isRegistering,    // ✅ Connected
    unregister,       // ✅ Connected
    isUnregistering,  // ✅ Connected
    deleteEvent,
  } = useEvents();

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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                Upcoming Events
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                Join events, workshops, and reunions. 
                <span className="inline-flex items-center text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> Earn 50 Points per event!
                </span>
              </p>
            </div>

            {canCreateEvents && (
              <CreateEventDialog
                onCreateEvent={createEvent}
                isCreating={isCreating}
              />
            )}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <Skeleton className="h-40 w-full" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="space-y-2 mt-4">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed"
            >
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Events Yet
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {canCreateEvents
                  ? "Be the first to create an event and bring the community together!"
                  : "There are no upcoming events at the moment. Check back later."}
              </p>
            </motion.div>
          )}

          {/* Events Grid */}
          {!isLoading && events.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  // 👇 Passing functions explicitly
                  onRegister={register}
                  onUnregister={unregister}
                  onDelete={deleteEvent}
                  isRegistering={isRegistering}
                  isUnregistering={isUnregistering}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;