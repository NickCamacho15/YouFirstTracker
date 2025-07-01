import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Target, Zap } from "lucide-react";
import { format, subDays, addDays, startOfDay, isSameDay } from "date-fns";

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
  reasons?: string[];
  category?: string;
}

interface HabitCardProps {
  habit: Habit;
  onUpdate: () => void;
  onClick?: () => void;
}

export function HabitCard({ habit, onUpdate, onClick }: HabitCardProps) {
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

    // Generate next 40 days starting from today
    for (let i = 0; i < 40; i++) {
      const currentDate = addDays(today, i);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const isToday = i === 0;
      const isCompleted = completedDates.has(dateKey);
      const dayOfWeek = currentDate.getDay();
      
      days.push(
        <div
          key={i}
          className={`w-3 h-8 rounded-sm transition-all duration-200 hover:scale-110 ${
            isToday
              ? "bg-blue-500 border-2 border-blue-600 shadow-md"
              : isCompleted
              ? "bg-green-500 shadow-sm"
              : dayOfWeek === 0 || dayOfWeek === 6
              ? "bg-muted/80 border border-muted-foreground/20"
              : "bg-muted/60 border border-muted-foreground/10"
          }`}
          title={`${format(currentDate, 'MMM d')} - ${
            isToday 
              ? 'Today' 
              : isCompleted 
              ? 'Completed' 
              : 'Upcoming'
          }`}
        >
          {isToday && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
          {isCompleted && !isToday && (
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
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-accent/50 bg-gradient-to-br from-card to-card/95"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              size="lg"
              className={`w-16 h-16 rounded-full relative transition-all duration-300 transform active:scale-95 ${
                habit.completedToday
                  ? "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl border-0"
                  : "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl border-0 hover:scale-105"
              }`}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleHabitMutation.mutate();
              }}
              disabled={toggleHabitMutation.isPending}
            >
              {habit.completedToday ? (
                <div className="flex flex-col items-center">
                  <Check className="w-7 h-7" />
                  <span className="text-xs font-bold">DONE</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 border-3 border-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold">TAP</span>
                </div>
              )}
              {stats.currentStreak >= 7 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Flame className="w-4 h-4 text-white" />
                </div>
              )}
              {habit.completedToday && (
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 animate-ping"></div>
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
            <h5 className="text-sm font-medium text-muted-foreground">Next 40 Days</h5>
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
