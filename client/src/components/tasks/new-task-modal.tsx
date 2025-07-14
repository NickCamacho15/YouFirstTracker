import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (task: any) => void;
  goals: Array<{
    id: number;
    title: string;
    color: string;
  }>;
  selectedDay: number;
}

export function NewTaskModal({ open, onOpenChange, onSuccess, goals, selectedDay }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState<string>("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    if (!goalId) return;

    setIsSubmitting(true);
    
    try {
      const newTask = {
        id: `task-${Date.now()}`,
        text: title.trim(),
        description: description.trim(),
        goalId: goalId === "personal" ? null : parseInt(goalId),
        time: time.trim(),
        priority: parseInt(priority),
        completed: false,
        day: selectedDay
      };

      onSuccess(newTask);
      
      // Reset form
      setTitle("");
      setDescription("");
      setGoalId("");
      setTime("");
      setPriority("2");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a task and link it to a goal to track progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="goal">Link to Goal</Label>
            <Select value={goalId} onValueChange={setGoalId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal (No Goal)</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id.toString()}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Time/Deadline</Label>
              <Input
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 2 PM, Due Friday"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High Priority</SelectItem>
                  <SelectItem value="2">Medium Priority</SelectItem>
                  <SelectItem value="3">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !goalId}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}