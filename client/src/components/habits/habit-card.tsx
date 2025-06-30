import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
}

interface HabitCardProps {
  habit: Habit;
  onUpdate: () => void;
}

export function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleHabitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/habits/${habit.id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      onUpdate();
      toast({ 
        title: habit.completedToday ? "Habit unchecked" : "Great work!", 
        description: habit.completedToday ? "Habit marked as incomplete" : "Habit completed for today!" 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate week view (simplified - just showing completion status)
  const generateWeekView = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const isToday = i === 0;
      const isCompleted = isToday ? habit.completedToday : Math.random() > 0.3; // Mock past data
      
      days.push(
        <div
          key={i}
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isCompleted
              ? "bg-green-200"
              : isToday
              ? "bg-accent border-2 border-dashed border-accent/50"
              : "bg-gray-200"
          }`}
        >
          {isCompleted && (
            <Check className="w-4 h-4 text-green-600" />
          )}
          {isToday && !isCompleted && (
            <span className="text-white text-xs font-bold">!</span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Button
              size="lg"
              className={`w-12 h-12 rounded-xl ${
                habit.completedToday
                  ? "bg-green-100 hover:bg-green-200 text-green-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              variant="ghost"
              onClick={() => toggleHabitMutation.mutate()}
              disabled={toggleHabitMutation.isPending}
            >
              {habit.completedToday ? (
                <Check className="w-6 h-6" />
              ) : (
                <div className="w-6 h-6 border-2 border-current rounded" />
              )}
            </Button>
            <div>
              <h4 className="font-semibold text-primary">{habit.title}</h4>
              <p className="text-muted-foreground text-sm">
                {habit.frequency} {habit.description && ` • ${habit.description}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-accent">{habit.streak}</div>
            <div className="text-xs text-muted-foreground">day streak</div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="flex space-x-1">
          {generateWeekView()}
        </div>
      </CardContent>
    </Card>
  );
}
