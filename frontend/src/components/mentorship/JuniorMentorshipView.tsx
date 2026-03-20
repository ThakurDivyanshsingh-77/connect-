import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CalendarClock, ListChecks, Loader2, NotebookPen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/utils/config";
import {
  type Mentorship,
  type MentorshipNote,
  type MentorshipProgress,
  type MentorshipSession,
  useMentorshipJunior,
} from "@/hooks/useMentorship";

const getAvatarUrl = (url?: string | null) => {
  if (!url) return undefined;
  return url;
};

export function JuniorMentorshipView() {
  const api = useMentorshipJunior();
  const mentorship = api.mentorship as Mentorship | null;
  const mentorshipId = mentorship?._id;

  const mentor = useMemo(() => {
    if (!mentorship) return null;
    return typeof mentorship.mentor === "string" ? null : mentorship.mentor;
  }, [mentorship]);

  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [notes, setNotes] = useState<MentorshipNote[]>([]);
  const [progress, setProgress] = useState<MentorshipProgress | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!mentorshipId) return;
      setLoadingDetails(true);
      try {
        const [s, n, p] = await Promise.all([
          api.fetchSessions(mentorshipId),
          api.fetchNotes(mentorshipId),
          api.fetchProgress(mentorshipId),
        ]);
        setSessions(s);
        setNotes(n);
        setProgress(p);
      } finally {
        setLoadingDetails(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorshipId]);

  if (api.isLoading) {
    return (
      <div className="h-[560px] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!mentorship) {
    return (
      <div className="h-[560px] flex items-center justify-center text-muted-foreground">
        No mentorship yet. Request mentorship from a teacher profile.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={getAvatarUrl(mentor?.avatar_url)} />
              <AvatarFallback>{mentor?.name?.charAt(0) || "T"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold truncate">Mentor: {mentor?.name || "Teacher"}</h2>
                <Badge variant="outline" className="capitalize">{mentorship.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {mentorship.startedAt
                  ? `Started ${formatDistanceToNow(new Date(mentorship.startedAt), { addSuffix: true })}`
                  : mentorship.status === "pending"
                    ? "Request pending approval"
                    : "Not started yet"}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{progress?.overallPercent ?? 0}%</Badge>
        </div>
        <div className="mt-3">
          <Progress value={progress?.overallPercent ?? 0} />
        </div>
      </Card>

      <Tabs defaultValue="sessions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions" className="gap-2">
            <CalendarClock className="h-4 w-4" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <NotebookPen className="h-4 w-4" /> Notes
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <ListChecks className="h-4 w-4" /> Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Session history</div>
            <ScrollArea className="h-[420px]">
              <div className="p-4 space-y-3">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">No sessions yet.</div>
                ) : (
                  sessions.map((s) => (
                    <div key={s._id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm whitespace-pre-wrap flex-1">{s.summary}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(s.occurredAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Notes from mentor</div>
            <ScrollArea className="h-[420px]">
              <div className="p-4 space-y-3">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">No notes yet.</div>
                ) : (
                  notes.map((n) => (
                    <div key={n._id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm whitespace-pre-wrap flex-1">{n.content}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Overall progress</div>
              <Badge variant="secondary">{progress?.overallPercent ?? 0}%</Badge>
            </div>
            <Progress value={progress?.overallPercent ?? 0} />

            {(progress?.goals || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No goals yet.</div>
            ) : (
              <div className="space-y-2">
                {(progress?.goals || []).map((g, idx) => (
                  <div key={`${idx}-${g.title}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{g.title}</div>
                      <Badge variant="outline">{g.percent}%</Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={g.percent} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

