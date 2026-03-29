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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const userId = user?.id || (user as any)?._id;
  const joinedRoomCount = rooms.filter((room) => room.members.includes(userId)).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
          <section className="rounded-3xl border bg-card/60 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Community Rooms</h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Join discussions, mentorship groups, class communities, and event channels without losing readability on smaller screens.
                </p>
              </div>

              {canCreateRoom && (
                <Button onClick={() => setIsModalOpen(true)} className="w-full gap-2 sm:w-auto">
                  <PlusCircle className="h-4 w-4" />
                  Create Room
                </Button>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Card className="rounded-2xl border-dashed">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Rooms</p>
                  <p className="mt-2 text-2xl font-semibold">{rooms.length}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-dashed">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">My Rooms</p>
                  <p className="mt-2 text-2xl font-semibold">{joinedRoomCount}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-dashed">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visible Now</p>
                  <p className="mt-2 text-2xl font-semibold">{filteredRooms.length}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="rounded-3xl border bg-card/40 p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
                <div className="overflow-x-auto pb-2">
                  <TabsList className="h-auto min-w-max flex-nowrap justify-start gap-1 rounded-xl p-1">
                    <TabsTrigger value="all" className="px-3 py-2 text-xs sm:px-4 sm:text-sm">All Rooms</TabsTrigger>
                    <TabsTrigger value="my" className="px-3 py-2 text-xs sm:px-4 sm:text-sm">My Rooms</TabsTrigger>
                    <TabsTrigger value="teacher" className="px-3 py-2 text-xs sm:px-4 sm:text-sm">Classes</TabsTrigger>
                    <TabsTrigger value="event" className="px-3 py-2 text-xs sm:px-4 sm:text-sm">Events</TabsTrigger>
                    <TabsTrigger value="senior" className="px-3 py-2 text-xs sm:px-4 sm:text-sm">Mentorship</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
              
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="h-11 rounded-xl pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.length === 0 ? (
              <Card className="col-span-full rounded-3xl border-dashed">
                <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <Users className="mb-4 h-10 w-10 text-muted-foreground/70" />
                  <h2 className="text-xl font-semibold">No rooms found</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Try changing the tab or search term. We could not find any rooms matching your current filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRooms.map((room) => {
                const isJoined = room.members.includes(userId);

                return (
                  <Card
                    key={room._id}
                    className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardHeader className="space-y-3 pb-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Badge variant={room.type === "admin" ? "destructive" : "secondary"} className="capitalize">
                          {room.type}
                        </Badge>
                        {room.isPrivate && <Badge variant="outline">Private</Badge>}
                      </div>

                      <div className="space-y-2">
                        <CardTitle className="line-clamp-2 text-lg sm:text-xl">{room.name}</CardTitle>
                        <CardDescription className="min-h-[60px] line-clamp-3 text-sm sm:min-h-[72px]">
                          {room.description || "No description provided."}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="mt-auto flex flex-1 flex-col justify-end">
                      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {room.members.length} members
                        </div>
                        <Badge variant="outline" className="max-w-full truncate">
                          by {room.createdBy?.name || "Unknown"}
                        </Badge>
                      </div>

                      <Button
                        className="w-full rounded-xl"
                        variant={isJoined ? "secondary" : "default"}
                        onClick={() => handleJoin(room._id)}
                      >
                        {isJoined ? (
                          <>
                            <MessagesSquare className="mr-2 h-4 w-4" />
                            Open Chat
                          </>
                        ) : (
                          "Join Room"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>

          {isModalOpen && (
            <CreateRoomModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchRooms}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
