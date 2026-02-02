import { useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SkillsManagerProps {
  skills: string[];
  userId: string; // Halanki backend token se user nikal lega, par prop rehne dete hain
  onUpdate: () => void;
}

const SUGGESTED_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java",
  "AWS", "Docker", "Kubernetes", "Machine Learning", "Data Science",
  "UI/UX Design", "Product Management", "Leadership", "Communication",
  "MongoDB", "Express", "SQL", "Git", "Agile"
];

export function SkillsManager({ skills = [], userId, onUpdate }: SkillsManagerProps) {
  const [newSkill, setNewSkill] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // 1. Add Skill Function
  const handleAddSkill = async (skill: string) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;

    // Check Duplicate
    if (skills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())) {
      toast({
        title: "Skill exists",
        description: "This skill is already in your list.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updatedSkills = [...skills, trimmedSkill];
      const token = localStorage.getItem("token");

      // 📡 API Call
      await axios.put(`${API_URL}/api/users/skills`, 
        { skills: updatedSkills }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await onUpdate(); // Refresh Parent
      setNewSkill(""); // Clear Input

      toast({ title: "Skill added", description: `"${trimmedSkill}" added successfully.` });
    } catch (error) {
      console.error("Add skill error:", error);
      toast({ title: "Error", description: "Failed to add skill.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  // 2. Remove Skill Function
  const handleRemoveSkill = async (skillToRemove: string) => {
    setIsUpdating(true);

    try {
      const updatedSkills = skills.filter((s) => s !== skillToRemove);
      const token = localStorage.getItem("token");

      // 📡 API Call
      await axios.put(`${API_URL}/api/users/skills`, 
        { skills: updatedSkills }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await onUpdate(); // Refresh Parent

      toast({ title: "Skill removed", description: `"${skillToRemove}" removed successfully.` });
    } catch (error) {
      console.error("Remove skill error:", error);
      toast({ title: "Error", description: "Failed to remove skill.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(newSkill);
    }
  };

  // Filter suggestions (Jo already add nahi hain wahi dikhaye)
  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !skills.some((skill) => skill.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Current Skills List */}
      <div>
        <h3 className="text-sm font-medium mb-3">Your Skills</h3>
        {skills.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No skills added yet. Add some skills to showcase your expertise!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  disabled={isUpdating}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Add New Skill Input */}
      <div>
        <h3 className="text-sm font-medium mb-3">Add New Skill</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Type a skill (e.g. React)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUpdating}
            className="flex-1"
          />
          <Button
            onClick={() => handleAddSkill(newSkill)}
            disabled={!newSkill.trim() || isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Suggested Skills Chips */}
      {availableSuggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Suggested Skills</h3>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1"
                onClick={() => handleAddSkill(skill)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}