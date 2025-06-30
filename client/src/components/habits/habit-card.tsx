import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Target, Zap } from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

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

  // Fetch habit logs for the visual tracker
  const { data: habitLogs = [] } = useQuery<HabitLog[]>({
    queryKey: ["/api/habits", habit.id, "logs"],
  });

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

  // Generate 40-day view for enhanced tracking
  const generate40DayView = () => {
    const days = [];
    const today = new Date();
    
    // Create a map of completed dates for fast lookup
    const completedDates = new Map();
    habitLogs.forEach(log => {
      if (log.completed) {
        const logDate = new Date(log.date);
        const dateKey = format(logDate, 'yyyy-MM-dd');
        completedDates.set(dateKey, true);
      }
    });

    // Generate last 40 days
    for (let i = 39; i >= 0; i--) {
      const currentDate = subDays(today, i);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const isToday = i === 0;
      const isCompleted = completedDates.has(dateKey);
      const dayOfWeek = currentDate.getDay();
      
      // Calculate intensity based on streak position
      const intensity = isCompleted ? (i < 7 ? 'high' : i < 20 ? 'medium' : 'low') : 'none';
      
      days.push(
        <div
          key={i}
          className={`w-3 h-8 rounded-sm transition-all duration-200 hover:scale-110 ${
            isCompleted
              ? intensity === 'high'
                ? "bg-green-500 shadow-sm"
                : intensity === 'medium'
                ? "bg-green-400"
                : "bg-green-300"
              : isToday
              ? "bg-accent border border-accent-foreground/20 animate-pulse"
              : dayOfWeek === 0 || dayOfWeek === 6
              ? "bg-muted/60"
              : "bg-muted/40"
          }`}
          title={`${format(currentDate, 'MMM d')} - ${isCompleted ? 'Completed' : 'Not completed'}`}
        >
          {isCompleted && i < 7 && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Calculate streak stats
  const getStreakStats = () => {
    const completedDays = habitLogs.filter(log => log.completed).length;
    const consistency = habitLogs.length > 0 ? Math.round((completedDays / Math.min(habitLogs.length, 40)) * 100) : 0;
    
    return {
      totalCompleted: completedDays,
      consistency,
      currentStreak: habit.streak
    };
  };

  const stats = getStreakStats();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <Button
              size="lg"
              className={`w-12 h-12 rounded-xl relative ${
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
              {stats.currentStreak >= 7 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </Button>
            <div>
              <h4 className="font-semibold text-primary">{habit.title}</h4>
              <p className="text-muted-foreground text-sm">
                {habit.frequency} {habit.description && ` • ${habit.description}`}
              </p>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="text-right space-y-1">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-lg font-bold text-accent flex items-center">
                  {stats.currentStreak}
                  {stats.currentStreak >= 7 && <Flame className="w-4 h-4 ml-1 text-orange-500" />}
                </div>
                <div className="text-xs text-muted-foreground">streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.consistency}%</div>
                <div className="text-xs text-muted-foreground">consistent</div>
              </div>
            </div>
          </div>
        </div>

        {/* 40-Day Visual Tracker */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-medium text-muted-foreground">Last 40 Days</h5>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted rounded-sm"></div>
                <span>Missed</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {generate40DayView()}
          </div>
          
          {/* Quick Stats */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.totalCompleted} days completed</span>
            <span>
              {stats.currentStreak >= 30 ? "🏆 Champion!" : 
               stats.currentStreak >= 14 ? "🔥 On Fire!" : 
               stats.currentStreak >= 7 ? "⚡ Strong!" : 
               "💪 Building momentum"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
