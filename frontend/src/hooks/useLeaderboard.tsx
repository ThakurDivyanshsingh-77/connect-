import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";

// UI ke hisab se Interface
export interface LeaderboardUser {
  userId: string;
  rank: number;
  name: string;
  avatarUrl?: string;
  department?: string;
  batch?: string;
  company?: string;
  role: string;
  totalPoints: number;
}

export const useLeaderboard = () => {
  const [juniorLeaderboard, setJuniorLeaderboard] = useState<LeaderboardUser[]>([]);
  const [seniorLeaderboard, setSeniorLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/users/leaderboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Image URL Helper
        const getAvatar = (path?: string) => {
          if (!path) return undefined;
          const cleanPath = path.replace(/\\/g, "/");
          return cleanPath.startsWith("http") ? cleanPath : `${API_URL}/${cleanPath}`;
        };

        // Data Transformation (Backend -> UI)
        const allUsers = data.map((u: any) => ({
          userId: u._id,                   // Map _id to userId
          name: u.name,
          avatarUrl: getAvatar(u.avatar_url),
          department: u.field_of_study || "Student", // Map field_of_study to department
          batch: u.batch,
          company: u.company,
          role: u.role,
          totalPoints: u.points || 0       // Map points to totalPoints
        }));

        // Filter Juniors (Students)
        const juniors = allUsers
          .filter((u: any) => u.role === 'student' || u.role === 'junior')
          .map((u: any, i: number) => ({ ...u, rank: i + 1 }));

        // Filter Seniors (Alumni/Teachers)
        const seniors = allUsers
          .filter((u: any) => u.role === 'alumni' || u.role === 'senior' || u.role === 'teacher')
          .map((u: any, i: number) => ({ ...u, rank: i + 1 }));

        setJuniorLeaderboard(juniors);
        setSeniorLeaderboard(seniors);

      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { juniorLeaderboard, seniorLeaderboard, isLoading };
};