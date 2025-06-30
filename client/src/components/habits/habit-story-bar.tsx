import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { format, startOfDay, isSameDay } from "date-fns";

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

interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

interface HabitStoryBarProps {
  habits: Habit[];
  onUpdate: () => void;
  onAddHabit: () => void;
}

export function HabitStoryBar({ habits, onUpdate, onAddHabit }: HabitStoryBarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const result = await apiRequest(`/api/habits/${habitId}/toggle`, "POST");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update habit",
        variant: "destructive",
      });
    },
  });

  const handleToggleHabit = (habitId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggling habit:', habitId);
    toggleHabitMutation.mutate(habitId);
  };

  // Get color for habit based on category and index
  const getHabitColor = (habit: Habit, index: number) => {
    if (habit.category === 'mind') {
      return 'from-purple-500 to-indigo-500';
    } else if (habit.category === 'body') {
      return 'from-orange-500 to-red-500';
    } else if (habit.category === 'soul') {
      return 'from-emerald-500 to-teal-500';
    }
    
    // Fallback colors if no category
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-yellow-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500',
    ];
    return colors[index % colors.length];
  };

  // Get habit log for today to check completion status
  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs"],
    enabled: habits.length > 0
  });

  const isHabitCompletedToday = (habitId: number) => {
    const today = startOfDay(new Date());
    return (habitLogs as HabitLog[]).some((log: HabitLog) => 
      log.habitId === habitId && 
      log.completed && 
      isSameDay(new Date(log.date), today)
    );
  };

  return (
    <div className="w-full bg-background border-b border-border">
      <div className="flex items-center space-x-4 p-4 overflow-x-auto">
        {/* Add New Habit Story */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onAddHabit}
            className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/50 hover:border-accent transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
          </Button>
          <p className="text-xs text-center mt-2 text-muted-foreground max-w-16 truncate">Add Habit</p>
        </div>

        {/* Habit Stories */}
        {habits.map((habit, index) => {
          const isCompleted = isHabitCompletedToday(habit.id);
          const isLoading = toggleHabitMutation.isPending;
          const habitColor = getHabitColor(habit, index);
          
          return (
            <div key={habit.id} className="flex-shrink-0 flex flex-col items-center">
              <div className="relative">
                {/* Completion Ring */}
                <div className={`w-16 h-16 rounded-full p-0.5 transition-all duration-300 ${
                  isCompleted 
                    ? `bg-gradient-to-r ${habitColor} shadow-lg shadow-${habitColor.split('-')[1]}-500/25` 
                    : "bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/30"
                }`}>
                  {/* Inner Circle */}
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={(e) => handleToggleHabit(habit.id, e)}
                    disabled={isLoading}
                    className={`w-full h-full rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? "bg-green-500 border-green-400 hover:bg-green-600"
                        : "bg-background border-muted hover:border-accent hover:bg-accent/10"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/50" />
                    )}
                  </Button>
                </div>
                
                {/* Streak Badge */}
                {habit.streak > 0 && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {habit.streak}
                  </div>
                )}
              </div>
              
              {/* Habit Name */}
              <p className="text-xs text-center mt-2 text-foreground max-w-16 truncate">
                {habit.title}
              </p>
            </div>
          );
        })}
        
        {/* Spacer for scroll */}
        <div className="w-4 flex-shrink-0" />
      </div>
    </div>
  );
}