import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ThumbsDown, ThumbsUp, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMentorshipTeacher } from "@/hooks/useMentorship";
import { MentorshipDetail } from "@/components/mentorship/MentorshipDetail";
import { JuniorMentorshipView } from "@/components/mentorship/JuniorMentorshipView";
import { API_URL } from "@/utils/config";

const getAvatarUrl = (url?: string | null) => {
  if (!url) return undefined;
  return url;
};

export default function Mentorship() {
  const { role } = useAuth();

  if (role === "junior") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Users className="h-7 w-7 text-primary" /> Mentorship
              </h1>
              <p className="text-muted-foreground">Your mentorship progress, sessions and notes.</p>
            </div>
            <Card className="p-4">
              <JuniorMentorshipView />
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const api = useMentorshipTeacher();
  const [selectedMentorshipId, setSelectedMentorshipId] = useState<string | null>(null);
  const requests = api.requests || [];
  const mentees = api.mentees || [];

  const combined = useMemo(() => {
    const active = mentees.map((m) => ({ kind: "active" as const, item: m }));
    const pending = requests.map((r) => ({ kind: "pending" as const, item: r }));
    return [...pending, ...active];
  }, [mentees, requests]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" /> Mentorship
            </h1>
            <p className="text-muted-foreground">Manage mentorship requests, mentees, sessions, notes and progress.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold">Requests & mentees</div>
                <Button variant="outline" size="sm" onClick={() => void Promise.all([api.fetchRequests(), api.fetchMentees()])} disabled={api.isLoading}>
                  {api.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>
              <ScrollArea className="h-[560px]">
                <div className="p-3 space-y-2">
                  {combined.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-10">No mentorship requests yet.</div>
                  ) : (
                    combined.map(({ kind, item }) => {
                      const mentee = (item as any).mentee;
                      const isSelected = selectedMentorshipId === item._id;
                      return (
                        <button
                          key={`${kind}-${item._id}`}
                          className={`w-full text-left rounded-lg border p-3 hover:bg-accent/40 transition-colors ${isSelected ? "bg-accent" : "bg-card"}`}
                          onClick={() => setSelectedMentorshipId(item._id)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage src={getAvatarUrl(mentee?.avatar_url)} />
                              <AvatarFallback>{mentee?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium truncate">{mentee?.name || "Mentee"}</div>
                                <Badge variant={kind === "pending" ? "secondary" : "outline"} className="capitalize">
                                  {kind === "pending" ? "pending" : "active"}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {mentee?.designation || mentee?.field_of_study || "Junior"}
                              </div>

                              {kind === "pending" && (
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      void api.respond(item._id, "approve");
                                    }}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      void api.respond(item._id, "reject");
                                    }}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>

            <Card className="lg:col-span-2 p-4">
              {!selectedMentorshipId ? (
                <div className="h-[560px] flex items-center justify-center text-muted-foreground">
                  Select a request or mentee to view details.
                </div>
              ) : (
                <MentorshipDetail mentorshipId={selectedMentorshipId} />
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

