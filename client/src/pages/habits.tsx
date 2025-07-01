import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, CheckCircle2, Circle, Flame, Star, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HabitFormationTracker } from "@/components/habits/habit-formation-tracker";
import { FoundationsDashboard } from "@/components/habits/foundations-dashboard";
import { EditHabitModal } from "@/components/habits/edit-habit-modal";
import { HabitHealthScore } from "@/components/habits/habit-health-score";

interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
  reasons?: string[];
  category?: string;
  timeOfDay?: string;
}

const getCategoryColors = (category?: string) => {
  switch (category) {
    case 'mind':
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        light: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'body':
      return {
        bg: 'bg-gradient-to-r from-orange-500 to-red-600',
        light: 'bg-orange-50 dark:bg-orange-950/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
      };
    case 'soul':
      return {
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        light: 'bg-emerald-50 dark:bg-emerald-950/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
        light: 'bg-gray-50 dark:bg-gray-950/20',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-800'
      };
  }
};

const getTimeOfDayEmoji = (timeOfDay?: string) => {
  switch (timeOfDay) {
    case 'morning': return '🌅';
    case 'afternoon': return '☀️';
    case 'evening': return '🌆';
    case 'night': return '🌙';
    default: return '📅';
  }
};

const getTimeOfDayLabel = (timeOfDay?: string) => {
  switch (timeOfDay) {
    case 'morning': return 'Morning';
    case 'afternoon': return 'Afternoon';
    case 'evening': return 'Evening';
    case 'night': return 'Night';
    default: return 'Any time';
  }
};

export default function HabitsPage() {
  const [editHabitModalOpen, setEditHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading, error } = useQuery({
    queryKey: ['/api/habits'],
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: number; completed: boolean }) => {
      const response = await apiRequest(`/api/habits/${habitId}/toggle`, 'POST', { completed });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Success",
        description: "Habit updated successfully",
      });
    },
    onError: (error) => {
      console.error('Toggle habit error:', error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    },
  });

  const handleToggleHabit = (habitId: number) => {
    const habit = (habits as Habit[]).find(h => h.id === habitId);
    if (habit) {
      toggleHabitMutation.mutate({ habitId, completed: !habit.completedToday });
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditHabitModalOpen(true);
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setEditHabitModalOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error loading habits</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-8 h-8 text-accent" />
              Your Habits
            </h1>
            <p className="text-muted-foreground mt-2">
              Build consistency and track your daily progress
            </p>
          </div>
          <Button onClick={handleAddHabit} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>

        {/* One-Click Habit Health Score */}
        <HabitHealthScore habits={habits as Habit[]} />

        {/* Habit Formation Progress */}
        <HabitFormationTracker habits={habits as Habit[]} />

        {/* Tabs */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <Tabs defaultValue="formation" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="formation" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Habit Formation & Foundations
              </TabsTrigger>
              <TabsTrigger value="foundations" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Foundations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="formation" className="space-y-6">
              <div className="grid gap-6">
                {(habits as Habit[]).map((habit) => {
                  const colors = getCategoryColors(habit.category);
                  const progressPercentage = Math.min((habit.streak / 67) * 100, 100);

                  return (
                    <Card key={habit.id} className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 ${
                      habit.completedToday ? `${colors.light} ring-2 ring-green-500` : 'hover:scale-[1.02]'
                    }`}>
                      <CardContent className="p-6">
                        {/* Top section with edit button */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getTimeOfDayEmoji(habit.timeOfDay)} {getTimeOfDayLabel(habit.timeOfDay)}
                            </Badge>
                            <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditHabit(habit)}
                            className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Habit name and description */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-foreground mb-1">{habit.title}</h3>
                          {habit.description && (
                            <p className="text-sm text-muted-foreground">{habit.description}</p>
                          )}
                        </div>

                        {/* Progress section */}
                        <div className="space-y-3">
                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">Progress to Formation</span>
                              <span className="text-muted-foreground">{habit.streak}/67 days</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${colors.bg}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              {habit.streak < 67 ? `${67 - habit.streak} days to go` : "Habit mastered - Bonus day for .uoY! 🎉"}
                            </div>
                          </div>

                          {/* Completion button and stats */}
                          <div className="space-y-3">
                            <Button
                              variant="ghost"
                              onClick={() => handleToggleHabit(habit.id)}
                              disabled={toggleHabitMutation.isPending}
                              className={`w-full h-12 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                                habit.completedToday
                                  ? `${colors.bg} border-green-500 text-white hover:opacity-90 shadow-lg`
                                  : `bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50`
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {habit.completedToday ? (
                                  <>
                                    <CheckCircle2 className="w-5 h-5 drop-shadow-lg" />
                                    <span className="font-medium">Completed!</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium">Mark Complete</span>
                                  </>
                                )}
                              </div>
                            </Button>

                            {/* Streak info */}
                            <div className="flex items-center justify-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-amber-600">
                                <Flame className="w-4 h-4" />
                                <span className="font-medium">{habit.streak} day streak</span>
                              </div>
                              {habit.completedToday && (
                                <div className="flex items-center gap-1 text-emerald-600">
                                  <Star className="w-4 h-4" />
                                  <span className="font-medium">Today!</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="foundations">
              <FoundationsDashboard 
                habits={habits as Habit[]} 
                onToggleHabit={handleToggleHabit}
                onEditHabit={handleEditHabit}
                isLoading={toggleHabitMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Habit Modal */}
        <EditHabitModal
          open={editHabitModalOpen}
          onOpenChange={setEditHabitModalOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
            setEditHabitModalOpen(false);
            setEditingHabit(null);
          }}
          habit={editingHabit}
        />
      </div>
    </div>
  );
}