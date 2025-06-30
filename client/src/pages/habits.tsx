import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitStoryBar } from "@/components/habits/habit-story-bar";
import { HabitFormationTracker } from "@/components/habits/habit-formation-tracker";
import { NewHabitModal } from "@/components/habits/new-habit-modal";
import { EditHabitModal } from "@/components/habits/edit-habit-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Zap, BarChart3, Grid3X3, CheckCircle2, Circle, Clock, Flame, Star, Settings } from "lucide-react";

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

export default function HabitsPage() {
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [showEditHabitModal, setShowEditHabitModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["/api/habits"],
  });

  const refreshHabits = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
  };

  const handleAddHabit = () => {
    setShowNewHabitModal(true);
  };

  // Habit toggle mutation
  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const result = await apiRequest(`/api/habits/${habitId}/toggle`, "POST", {});
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({
        title: "Success",
        description: "Habit updated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update habit",
        variant: "destructive",
      });
    },
  });

  const handleToggleHabit = (habitId: number) => {
    toggleHabitMutation.mutate(habitId);
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowEditHabitModal(true);
  };

  // Sort habits by time of day (morning -> afternoon -> evening -> anytime)
  const sortedHabits = (habits as Habit[]).sort((a, b) => {
    const timeOrder = { morning: 0, afternoon: 1, evening: 2, anytime: 3 };
    const timeA = timeOrder[a.timeOfDay as keyof typeof timeOrder] ?? 3;
    const timeB = timeOrder[b.timeOfDay as keyof typeof timeOrder] ?? 3;
    return timeA - timeB;
  });

  const getTimeOfDayEmoji = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '⏰';
    }
  };

  const getTimeOfDayLabel = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'evening': return 'Evening';
      default: return 'Anytime';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'mind': return { bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' };
      case 'body': return { bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' };
      case 'soul': return { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300' };
      default: return { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading your habits...</div>
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

        {/* Habit Stories - only show on Formation Science tab */}
        <div id="habit-stories-container" className="mb-8 hidden"></div>

        {/* Habits Content */}
        <div className="space-y-6">
          {habits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Habits Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building powerful habits that will transform your life.
                  </p>
                  <Button onClick={handleAddHabit} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Habit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Daily Tracker
                </TabsTrigger>
                <TabsTrigger value="formation" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Formation Science
                </TabsTrigger>
              </TabsList>

              <TabsContent value="formation" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Scientific Habit Formation</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Track your habits through the three scientifically-backed stages of formation. 
                    Research shows it takes an average of 66 days to form a new habit automatically.
                  </p>
                </div>
                <div className="space-y-8">
                  {(habits as Habit[]).map((habit) => (
                    <HabitFormationTracker key={habit.id} habit={habit} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="simple" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedHabits.map((habit) => {
                    const colors = getCategoryColor(habit.category);
                    const isLoading = toggleHabitMutation.isPending;
                    const progressPercentage = Math.min((habit.streak / 66) * 100, 100);
                    
                    return (
                      <Card key={habit.id} className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
                        habit.completedToday ? `${colors.light} ring-2 ring-green-400` : 'hover:scale-[1.02]'
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

                          {/* Habit title and description */}
                          <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{habit.title}</h3>
                            {habit.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{habit.description}</p>
                            )}
                          </div>

                          {/* Progress visualization */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>Progress to automaticity</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${colors.bg}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              {habit.streak < 66 ? `${66 - habit.streak} days to go` : "Habit formed! 🎉"}
                            </div>
                          </div>

                          {/* Completion button and stats */}
                          <div className="space-y-3">
                            <Button
                              variant="ghost"
                              onClick={() => handleToggleHabit(habit.id)}
                              disabled={isLoading}
                              className={`w-full h-12 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                                habit.completedToday
                                  ? `${colors.bg} border-green-400 text-white hover:opacity-90 shadow-lg`
                                  : `bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20`
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
                              <div className="flex items-center gap-1 text-orange-600">
                                <Flame className="w-4 h-4" />
                                <span className="font-medium">{habit.streak} day streak</span>
                              </div>
                              {habit.completedToday && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Star className="w-4 h-4" />
                                  <span className="font-medium">Today!</span>
                                </div>
                              )}
                            </div>
                          </div>

                            {/* Quick Stats */}
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${habit.completedToday ? 'text-green-600' : colors.text}`}>
                                {habit.streak}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                day{habit.streak !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* New Habit Modal */}
        <NewHabitModal
          open={showNewHabitModal}
          onOpenChange={setShowNewHabitModal}
          onSuccess={refreshHabits}
        />
      </div>
    </div>
  );
}