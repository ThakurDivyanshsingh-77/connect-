import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { useAuth } from "@/hooks/useAuth";

export type MentorshipStatus = "pending" | "active" | "rejected" | "ended";

export interface MentorshipUser {
  _id: string;
  name: string;
  role: "junior" | "senior" | "teacher" | "admin";
  avatar_url?: string | null;
  designation?: string | null;
  company?: string | null;
  batch?: string | null;
  field_of_study?: string | null;
}

export interface Mentorship {
  _id: string;
  mentor: MentorshipUser | string;
  mentee: MentorshipUser | string;
  status: MentorshipStatus;
  requestedAt?: string;
  respondedAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipRequestItem extends Mentorship {
  mentee: MentorshipUser;
}

export interface MentorshipMenteeItem extends Mentorship {
  mentee: MentorshipUser;
}

export interface MentorshipSession {
  _id: string;
  mentorship: string;
  createdBy: string;
  occurredAt: string;
  summary: string;
  linkedMessageIds?: string[];
  createdAt: string;
}

export interface MentorshipNote {
  _id: string;
  mentorship: string;
  author: string;
  content: string;
  visibleToMentee: boolean;
  createdAt: string;
}

export interface MentorshipGoal {
  title: string;
  status: "todo" | "in_progress" | "done";
  percent: number;
  updatedAt?: string;
}

export interface MentorshipProgress {
  _id?: string;
  mentorship: string;
  goals: MentorshipGoal[];
  overallPercent: number;
  updatedAt?: string;
}

const getToken = () => localStorage.getItem("token");

export function useMentorshipTeacher() {
  const { user, role } = useAuth();
  const userId = user?.id || (user as any)?._id;

  const isTeacher = role === "teacher";

  const [requests, setRequests] = useState<MentorshipRequestItem[]>([]);
  const [mentees, setMentees] = useState<MentorshipMenteeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = useMemo(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [userId]);

  const fetchRequests = useCallback(async () => {
    if (!userId || !isTeacher) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/mentorships/requests`, { headers: authHeaders });
      setRequests(data.requests || []);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, isTeacher, userId]);

  const fetchMentees = useCallback(async () => {
    if (!userId || !isTeacher) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/mentorships/mentees`, { headers: authHeaders });
      setMentees(data.mentees || []);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, isTeacher, userId]);

  const respond = useCallback(async (mentorshipId: string, action: "approve" | "reject") => {
    if (!userId || !isTeacher) return;
    await axios.post(
      `${API_URL}/api/mentorships/respond`,
      { mentorshipId, action },
      { headers: authHeaders }
    );
    await Promise.all([fetchRequests(), fetchMentees()]);
  }, [authHeaders, fetchMentees, fetchRequests, isTeacher, userId]);

  const fetchOverview = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}`, { headers: authHeaders });
    return data as { mentorship: Mentorship; progress?: MentorshipProgress | null };
  }, [authHeaders]);

  const fetchSessions = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}/sessions`, { headers: authHeaders });
    return (data.sessions || []) as MentorshipSession[];
  }, [authHeaders]);

  const createSession = useCallback(async (mentorshipId: string, payload: { summary: string; occurredAt?: string; linkedMessageIds?: string[] }) => {
    const { data } = await axios.post(`${API_URL}/api/mentorships/${mentorshipId}/sessions`, payload, { headers: authHeaders });
    return data.session as MentorshipSession;
  }, [authHeaders]);

  const fetchNotes = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}/notes`, { headers: authHeaders });
    return (data.notes || []) as MentorshipNote[];
  }, [authHeaders]);

  const createNote = useCallback(async (mentorshipId: string, payload: { content: string; visibleToMentee?: boolean }) => {
    const { data } = await axios.post(`${API_URL}/api/mentorships/${mentorshipId}/notes`, payload, { headers: authHeaders });
    return data.note as MentorshipNote;
  }, [authHeaders]);

  const fetchProgress = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}/progress`, { headers: authHeaders });
    return data.progress as MentorshipProgress;
  }, [authHeaders]);

  const updateProgress = useCallback(async (mentorshipId: string, payload: { goals: MentorshipGoal[]; overallPercent?: number }) => {
    const { data } = await axios.put(`${API_URL}/api/mentorships/${mentorshipId}/progress`, payload, { headers: authHeaders });
    return data.progress as MentorshipProgress;
  }, [authHeaders]);

  useEffect(() => {
    void Promise.all([fetchRequests(), fetchMentees()]);
  }, [fetchMentees, fetchRequests]);

  return {
    requests,
    mentees,
    isLoading,
    fetchRequests,
    fetchMentees,
    respond,
    fetchOverview,
    fetchSessions,
    createSession,
    fetchNotes,
    createNote,
    fetchProgress,
    updateProgress,
  };
}

export function useMentorshipJunior() {
  const { user, role } = useAuth();
  const userId = user?.id || (user as any)?._id;
  const isJunior = role === "junior";

  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = useMemo(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [userId]);

  const fetchMy = useCallback(async () => {
    if (!userId || !isJunior) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/mentorships/my`, { headers: authHeaders });
      setMentorship(data.mentorship || null);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, isJunior, userId]);

  const fetchSessions = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}/sessions`, { headers: authHeaders });
    return (data.sessions || []) as MentorshipSession[];
  }, [authHeaders]);

  const fetchNotes = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}/notes`, { headers: authHeaders });
    return (data.notes || []) as MentorshipNote[];
  }, [authHeaders]);

  const fetchProgress = useCallback(async (mentorshipId: string) => {
    const { data } = await axios.get(`${API_URL}/api/mentorships/${mentorshipId}/progress`, { headers: authHeaders });
    return data.progress as MentorshipProgress;
  }, [authHeaders]);

  useEffect(() => {
    void fetchMy();
  }, [fetchMy]);

  return {
    mentorship,
    isLoading,
    fetchMy,
    fetchSessions,
    fetchNotes,
    fetchProgress,
  };
}

