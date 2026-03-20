import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { API_URL } from "@/utils/config";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoomModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { role } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/rooms`, {
        name,
        description,
        type,
        isPrivate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Room created successfully!" });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ 
        variant: "destructive",
        title: "Error creating room",
        description: error.response?.data?.message || "An error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Community Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Room Name <span className="text-red-500">*</span></Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Placement Prep 2026" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What is this room about?" 
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Room Type <span className="text-red-500">*</span></Label>
            <Select onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(role === 'teacher' || role === 'admin') && <SelectItem value="teacher">Classes / Academics</SelectItem>}
                {(role === 'senior' || role === 'admin') && <SelectItem value="senior">Mentorship / Guide</SelectItem>}
                {role === 'admin' && <SelectItem value="admin">Official Announcements</SelectItem>}
                {role === 'junior' && <SelectItem value="user">Study Group</SelectItem>}
                {role === 'junior' && <SelectItem value="senior">Test</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-4 border rounded-lg p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Private Room</Label>
              <p className="text-xs text-muted-foreground">Only invited users can join this room.</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Room"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
