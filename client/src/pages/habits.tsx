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
import { CompactDashboard } from "@/components/habits/compact-dashboard";

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

        {/* Compact Whoop-style Rings Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Habits Ring */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke="#3b82f6" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - ((habits as Habit[]).filter(h => h.completedToday).length / Math.max((habits as Habit[]).length, 1)))}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">
                  {Math.round(((habits as Habit[]).filter(h => h.completedToday).length / Math.max((habits as Habit[]).length, 1)) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">HABITS</div>
          </div>

          {/* Foundations Ring */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke="#f59e0b" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - (Math.min(((habits as Habit[]).reduce((sum, h) => sum + h.streak, 0) / Math.max((habits as Habit[]).length, 1)) / 21, 1)))}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-amber-600">
                  {Math.round(Math.min(((habits as Habit[]).reduce((sum, h) => sum + h.streak, 0) / Math.max((habits as Habit[]).length, 1)) / 21, 1) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">FOUNDATIONS</div>
          </div>

          {/* Critical Tasks Ring */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke="#10b981" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.75)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-600">75%</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">TASKS</div>
          </div>

          {/* Reading Ring */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke="#8b5cf6" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.60)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">60%</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">READING</div>
          </div>
        </div>

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
                Foundations Dashboard
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

                          {/* Large Prominent Completion Button */}
                          <div className="space-y-4">
                            <Button
                              onClick={() => handleToggleHabit(habit.id)}
                              disabled={toggleHabitMutation.isPending}
                              className={`w-full h-16 rounded-2xl text-lg font-bold border-3 transition-all duration-300 hover:scale-105 transform-gpu shadow-lg hover:shadow-2xl ${
                                habit.completedToday
                                  ? `${colors.bg} border-green-400 text-white hover:opacity-90 shadow-green-500/25 pulse-success`
                                  : `bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-gray-300 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xl`
                              }`}
                            >
                              <div className="flex items-center justify-center gap-3">
                                {habit.completedToday ? (
                                  <>
                                    <CheckCircle2 className="w-7 h-7 drop-shadow-lg animate-bounce" />
                                    <span className="font-bold text-xl">Completed!</span>
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  </>
                                ) : (
                                  <>
                                    <div className="relative">
                                      <Circle className="w-7 h-7 text-gray-400" />
                                      <div className="absolute inset-0 w-7 h-7 border-2 border-blue-400 rounded-full opacity-0 hover:opacity-100 transition-opacity animate-pulse"></div>
                                    </div>
                                    <span className="font-bold text-xl">Mark Complete</span>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                                  </>
                                )}
                              </div>
                            </Button>

                            {/* Enhanced Progress Bar for Individual Habit */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-foreground">Progress to Formation</span>
                                <span className="text-muted-foreground">{habit.streak}/67 days</span>
                              </div>
                              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                                <div 
                                  className={`h-4 rounded-full transition-all duration-700 ease-out shadow-lg relative ${colors.bg}`}
                                  style={{ width: `${progressPercentage}%` }}
                                >
                                  {/* Shimmer effect */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {habit.streak < 67 ? `${67 - habit.streak} days to go` : "🎉 Habit mastered - Bonus day for .uoY!"}
                                </span>
                              </div>
                            </div>

                            {/* Streak info */}
                            <div className="flex items-center justify-center gap-6 text-sm bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-3 rounded-xl">
                              <div className="flex items-center gap-2 text-amber-600">
                                <Flame className="w-5 h-5" />
                                <span className="font-bold text-base">{habit.streak} day streak</span>
                              </div>
                              {habit.completedToday && (
                                <div className="flex items-center gap-2 text-emerald-600">
                                  <Star className="w-5 h-5 animate-pulse" />
                                  <span className="font-bold text-base">Today!</span>
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