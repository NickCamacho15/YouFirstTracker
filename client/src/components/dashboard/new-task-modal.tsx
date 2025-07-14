import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Goal {
  id: number;
  title: string;
}

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (task: { text: string; goalId: number; time?: string }) => void;
  goals: Goal[];
  selectedDay: number;
}

export function NewTaskModal({ open, onOpenChange, onSuccess, goals, selectedDay }: NewTaskModalProps) {
  const [taskText, setTaskText] = useState('');
  const [goalId, setGoalId] = useState<string>('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText || !goalId) return;

    onSuccess({
      text: taskText,
      goalId: parseInt(goalId),
      time: time || undefined
    });

    // Reset form
    setTaskText('');
    setGoalId('');
    setTime('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="taskText">Task Description</Label>
            <Input
              id="taskText"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Enter task description"
              required
            />
          </div>

          <div>
            <Label htmlFor="goal">Link to Goal</Label>
            <Select value={goalId} onValueChange={setGoalId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Personal (No specific goal)</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id.toString()}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time">Time (Optional)</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g., 10:00 AM"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}