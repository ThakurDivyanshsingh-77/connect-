import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PlusCircle, Users, MessagesSquare, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { CreateRoomModal } from "@/components/community/CreateRoomModal";

interface Room {
  _id: string;
  name: string;
  description: string;
  type: string;
  members: string[];
  isPrivate: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function Community() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoin = async (roomId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/rooms/${roomId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/community/${roomId}`);
    } catch (error: any) {
      if (error.response?.data?.message === "Already joined") {
        navigate(`/community/${roomId}`);
      } else {
        console.error("Failed to join room:", error);
      }
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(search.toLowerCase()) || 
                          (room.description && room.description.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === "all") return true;
    if (activeTab === "my") {
      const userId = user?.id || (user as any)?._id;
      return room.members.includes(userId);
    }
    return room.type === activeTab;
  });

  const canCreateRoom = role === "teacher" || role === "admin" || role === "senior";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container pt-24 pb-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Rooms</h1>
          <p className="text-muted-foreground mt-1">Join discussions, mentorship groups, and specific subject channels.</p>
        </div>
        {canCreateRoom && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Create Room
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="my">My Rooms</TabsTrigger>
            <TabsTrigger value="teacher">Classes</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
            <TabsTrigger value="senior">Mentorship</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search rooms..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No rooms found matching your criteria.
          </div>
        ) : (
          filteredRooms.map(room => (
            <Card key={room._id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant={room.type === 'admin' ? 'destructive' : 'secondary'} className="mb-2 capitalize">
                    {room.type}
                  </Badge>
                  {room.isPrivate && <Badge variant="outline">Private</Badge>}
                </div>
                <CardTitle className="text-xl line-clamp-1">{room.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-10">
                  {room.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {room.members.length} members
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant={room.members.includes(user?.id || (user as any)?._id) ? "secondary" : "default"}
                  onClick={() => handleJoin(room._id)}
                >
                  {room.members.includes(user?.id || (user as any)?._id) ? (
                    <><MessagesSquare className="mr-2 h-4 w-4" /> Open Chat</>
                  ) : (
                    "Join Room"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <CreateRoomModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchRooms} 
        />
      )}
      </main>
      <Footer />
    </div>
  );
}
