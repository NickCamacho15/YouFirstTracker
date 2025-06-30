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
    <div className="w-full bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-border/50 shadow-sm">
      <div className="flex items-center space-x-6 p-6 overflow-x-auto max-w-6xl mx-auto">
        {/* Add New Habit Story */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onAddHabit}
            className="w-20 h-20 rounded-full border-3 border-dashed border-muted-foreground/30 hover:border-accent hover:bg-accent/5 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Plus className="w-8 h-8 text-muted-foreground" />
          </Button>
          <p className="text-sm text-center mt-3 text-muted-foreground max-w-20 truncate font-medium">Add Habit</p>
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
                <div className={`w-20 h-20 rounded-full p-1 transition-all duration-300 ${
                  isCompleted 
                    ? `bg-gradient-to-r ${habitColor} shadow-xl` 
                    : "bg-gradient-to-r from-slate-200/60 to-slate-300/60 dark:from-slate-700/60 dark:to-slate-600/60"
                }`}>
                  {/* Inner Circle */}
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={(e) => handleToggleHabit(habit.id, e)}
                    disabled={isLoading}
                    className={`w-full h-full rounded-full transition-all duration-300 hover:scale-105 ${
                      isCompleted
                        ? `bg-gradient-to-r ${habitColor} border-0 shadow-lg hover:shadow-xl`
                        : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 text-white drop-shadow-lg" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full border-3 transition-all duration-300 ${
                        habit.category === 'mind' ? 'border-purple-400/50' :
                        habit.category === 'body' ? 'border-orange-400/50' :
                        habit.category === 'soul' ? 'border-emerald-400/50' :
                        'border-slate-400/50'
                      }`} />
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