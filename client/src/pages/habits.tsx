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

        {/* Large Whoop-style Rings Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Habits Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - ((habits as Habit[]).filter(h => h.completedToday).length / Math.max((habits as Habit[]).length, 1)))}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-blue-600">
                  {Math.round(((habits as Habit[]).filter(h => h.completedToday).length / Math.max((habits as Habit[]).length, 1)) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">HABITS</div>
          </div>

          {/* Foundations Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#f59e0b" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (Math.min(((habits as Habit[]).reduce((sum, h) => sum + h.streak, 0) / Math.max((habits as Habit[]).length, 1)) / 21, 1)))}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-amber-600">
                  {Math.round(Math.min(((habits as Habit[]).reduce((sum, h) => sum + h.streak, 0) / Math.max((habits as Habit[]).length, 1)) / 21, 1) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">FOUNDATIONS</div>
          </div>

          {/* Critical Tasks Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.75)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-emerald-600">75%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">TASKS</div>
          </div>

          {/* Reading Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#8b5cf6" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.60)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-purple-600">60%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">READING</div>
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
              <div className="space-y-8">
                {(habits as Habit[]).map((habit) => {
                  const colors = getCategoryColors(habit.category);
                  const progressPercentage = Math.min((habit.streak / 67) * 100, 100);

                  // Generate calendar view for last 30 days
                  const generateCalendarDays = () => {
                    const days = [];
                    for (let i = 29; i >= 0; i--) {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      const dayNumber = date.getDate();
                      const isToday = i === 0;
                      const isCompleted = i < habit.streak; // Simplified - real implementation would check actual logs
                      
                      days.push({
                        day: dayNumber,
                        isToday,
                        isCompleted,
                        date
                      });
                    }
                    return days;
                  };

                  const calendarDays = generateCalendarDays();

                  return (
                    <div key={habit.id} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      {/* Header */}
                      <div className={`${colors.bg} p-6 text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-1">{habit.title}</h3>
                            <p className="text-white/90">{habit.description || "Building consistency every day"}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-3xl font-black">{habit.streak}</div>
                              <div className="text-sm text-white/80">day streak</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHabit(habit)}
                              className="h-10 w-10 p-0 text-white hover:bg-white/20"
                            >
                              <Settings className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Calendar Grid */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Last 30 Days</h4>
                          <Badge variant="outline" className={`${colors.text} border-current`}>
                            {getTimeOfDayEmoji(habit.timeOfDay)} {getTimeOfDayLabel(habit.timeOfDay)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-10 gap-2 mb-6">
                          {calendarDays.map((day, index) => (
                            <div
                              key={index}
                              className={`
                                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer
                                ${day.isCompleted 
                                  ? `${colors.bg} text-white shadow-lg hover:scale-110` 
                                  : day.isToday 
                                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-400 hover:bg-blue-200' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {day.day}
                            </div>
                          ))}
                        </div>

                        {/* Large Gamified Completion Button */}
                        <div className="space-y-4">
                          <Button
                            onClick={() => handleToggleHabit(habit.id)}
                            disabled={toggleHabitMutation.isPending}
                            className={`
                              w-full h-20 rounded-2xl text-xl font-black transition-all duration-300 hover:scale-105 transform-gpu shadow-xl hover:shadow-2xl
                              ${habit.completedToday
                                ? `${colors.bg} text-white animate-pulse border-4 border-green-400 shadow-green-500/50`
                                : `bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-4 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400`
                              }
                            `}
                          >
                            <div className="flex items-center justify-center gap-4">
                              {habit.completedToday ? (
                                <>
                                  <CheckCircle2 className="w-10 h-10 animate-bounce drop-shadow-lg" />
                                  <span className="text-2xl">COMPLETED TODAY!</span>
                                  <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                                    <div className="w-3 h-3 bg-white rounded-full animate-ping delay-100"></div>
                                    <div className="w-3 h-3 bg-white rounded-full animate-ping delay-200"></div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="relative">
                                    <Circle className="w-10 h-10" />
                                    <div className="absolute inset-0 w-10 h-10 border-4 border-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                                  </div>
                                  <span className="text-2xl">TAP TO COMPLETE</span>
                                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                                </>
                              )}
                            </div>
                          </Button>

                          {/* Progress Visualization */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-900 dark:text-white">Formation Progress</span>
                              <span className="text-2xl font-bold" style={{ color: colors.bg.split(' ')[1] }}>
                                {habit.streak}/67
                              </span>
                            </div>
                            <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-6 rounded-full transition-all duration-1000 ease-out ${colors.bg} shadow-lg relative`}
                                style={{ width: `${progressPercentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                            <div className="text-center mt-3">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {habit.streak < 67 ? `${67 - habit.streak} days until habit mastery` : "🎉 Habit mastered - Bonus day for .uoY!"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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