import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.filter((e: any) => e._id !== id));
      toast({ title: "Deleted", description: "Event removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete event." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Calendar /> Manage Events
        </h1>
        
        {loading ? <Loader2 className="animate-spin" /> : (
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event: any) => (
                            <TableRow key={event._id}>
                                <TableCell className="font-medium">{event.title}</TableCell>
                                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(event._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {events.length === 0 && <TableRow><TableCell colSpan={4} className="text-center p-4">No events found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        )}
      </main>
    </div>
  );
}