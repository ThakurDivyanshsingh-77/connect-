import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CalendarClock, CheckCircle2, FileText, ListChecks, Loader2, NotebookPen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  type Mentorship,
  type MentorshipGoal,
  type MentorshipNote,
  type MentorshipProgress,
  type MentorshipSession,
  useMentorshipTeacher,
} from "@/hooks/useMentorship";

export function MentorshipDetail({ mentorshipId }: { mentorshipId: string }) {
  const { toast } = useToast();
  const api = useMentorshipTeacher();

  const [overview, setOverview] = useState<Mentorship | null>(null);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [notes, setNotes] = useState<MentorshipNote[]>([]);
  const [progress, setProgress] = useState<MentorshipProgress | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [sessionSummary, setSessionSummary] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const mentee = useMemo(() => {
    if (!overview) return null;
    return typeof overview.mentee === "string" ? null : overview.mentee;
  }, [overview]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [ov, sess, nts, prog] = await Promise.all([
        api.fetchOverview(mentorshipId),
        api.fetchSessions(mentorshipId),
        api.fetchNotes(mentorshipId),
        api.fetchProgress(mentorshipId),
      ]);
      setOverview(ov.mentorship);
      setSessions(sess);
      setNotes(nts);
      setProgress(prog);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load mentorship details" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorshipId]);

  const handleAddSession = async () => {
    if (!sessionSummary.trim()) return;
    try {
      await api.createSession(mentorshipId, { summary: sessionSummary.trim() });
      setSessionSummary("");
      setSessions(await api.fetchSessions(mentorshipId));
      toast({ title: "Session added" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to add session" });
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await api.createNote(mentorshipId, { content: noteContent.trim(), visibleToMentee: true });
      setNoteContent("");
      setNotes(await api.fetchNotes(mentorshipId));
      toast({ title: "Note added" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to add note" });
    }
  };

  const updateGoal = (index: number, patch: Partial<MentorshipGoal>) => {
    if (!progress) return;
    const nextGoals = [...(progress.goals || [])];
    nextGoals[index] = { ...nextGoals[index], ...patch };
    setProgress({ ...progress, goals: nextGoals });
  };

  const addGoal = () => {
    if (!progress) {
      setProgress({ mentorship: mentorshipId, goals: [{ title: "", status: "todo", percent: 0 }], overallPercent: 0 });
      return;
    }
    setProgress({
      ...progress,
      goals: [...(progress.goals || []), { title: "", status: "todo", percent: 0 }],
    });
  };

  const removeGoal = (index: number) => {
    if (!progress) return;
    const nextGoals = [...(progress.goals || [])];
    nextGoals.splice(index, 1);
    setProgress({ ...progress, goals: nextGoals });
  };

  const handleSaveProgress = async () => {
    if (!progress) return;
    try {
      const cleanedGoals = (progress.goals || [])
        .map((g) => ({
          title: g.title.trim(),
          status: g.status,
          percent: Math.max(0, Math.min(100, Number(g.percent) || 0)),
        }))
        .filter((g) => g.title);
      const saved = await api.updateProgress(mentorshipId, { goals: cleanedGoals });
      setProgress(saved);
      toast({ title: "Progress saved" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to save progress" });
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate">{mentee?.name || "Mentee"}</h2>
              <Badge variant="outline" className="capitalize">{overview?.status || "active"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {overview?.startedAt
                ? `Started ${formatDistanceToNow(new Date(overview.startedAt), { addSuffix: true })}`
                : "Not started yet"}
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadAll()} disabled={isLoading}>
            Refresh
          </Button>
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

        <TabsContent value="sessions" className="mt-4 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Add a session
              </div>
            </div>
            <Textarea
              value={sessionSummary}
              onChange={(e) => setSessionSummary(e.target.value)}
              placeholder="Session summary (what was discussed, next steps...)"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddSession} disabled={!sessionSummary.trim()}>
                Add session
              </Button>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Session history</div>
            <ScrollArea className="h-[360px]">
              <div className="p-4 space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">No sessions yet.</div>
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

        <TabsContent value="notes" className="mt-4 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="font-semibold flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-primary" /> Add a note
            </div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Mentoring notes"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                Add note
              </Button>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold">Notes</div>
            <ScrollArea className="h-[360px]">
              <div className="p-4 space-y-3">
                {notes.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">No notes yet.</div>
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

        <TabsContent value="progress" className="mt-4 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Overall progress
              </div>
              <Badge variant="secondary">{progress?.overallPercent ?? 0}%</Badge>
            </div>
            <Progress value={progress?.overallPercent ?? 0} />

            <div className="space-y-3">
              {(progress?.goals || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No goals yet. Add your first goal.</div>
              ) : (
                (progress?.goals || []).map((g, idx) => (
                  <div key={`${idx}-${g.title}`} className="rounded-lg border p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={g.title}
                        onChange={(e) => updateGoal(idx, { title: e.target.value })}
                        placeholder="Goal title"
                      />
                      <Button variant="outline" onClick={() => removeGoal(idx)}>
                        Remove
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div className="text-xs text-muted-foreground">Percent</div>
                      <Input
                        type="number"
                        className="w-24"
                        value={g.percent}
                        onChange={(e) => updateGoal(idx, { percent: Number(e.target.value) })}
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={addGoal}>
                Add goal
              </Button>
              <Button onClick={handleSaveProgress}>
                Save progress
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

