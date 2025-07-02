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
import { SlideToComplete } from "@/components/habits/slide-to-complete";

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
                Habit Formation
              </TabsTrigger>
              <TabsTrigger value="foundations" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Foundations Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="formation" className="space-y-6">
              {/* Scientific Habit Formation Overview */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">67-Day Formation Science</CardTitle>
                      <p className="text-sm text-muted-foreground">Research-backed habit formation with bonus day for .uoY</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stage 1: Initial Formation */}
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-blue-200 dark:text-blue-800" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="32" 
                            stroke="#3b82f6" 
                            strokeWidth="6" 
                            fill="none" 
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.3)}`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">1-18</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Initial Formation</h3>
                      <p className="text-sm text-muted-foreground">Building awareness and momentum. Focus on consistency over perfection.</p>
                    </div>

                    {/* Stage 2: Strengthening */}
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-orange-200 dark:text-orange-800" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="32" 
                            stroke="#f59e0b" 
                            strokeWidth="6" 
                            fill="none" 
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.6)}`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-orange-600">19-45</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Strengthening</h3>
                      <p className="text-sm text-muted-foreground">Neural pathway development. The habit becomes more automatic.</p>
                    </div>

                    {/* Stage 3: Automaticity */}
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-emerald-200 dark:text-emerald-800" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="32" 
                            stroke="#10b981" 
                            strokeWidth="6" 
                            fill="none" 
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.9)}`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-600">46-67</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Automaticity + .uoY</h3>
                      <p className="text-sm text-muted-foreground">Habit becomes automatic. Day 67 is your bonus day for .uoY mastery!</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg">
                    <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                      <strong>Science-backed approach:</strong> Based on research from University College London and behavioral psychology studies. 
                      Each stage represents critical neural pathway development for lasting habit formation.
                    </p>
                  </div>
                </CardContent>
              </Card>

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
                        <div className="relative z-10">
                          {/* Title and Settings Row */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h1 className="text-2xl font-bold mb-1">{habit.title}</h1>
                              <p className="text-white/80 text-sm">{habit.description || "Building consistency every day"}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHabit(habit)}
                              className="h-8 w-8 p-0 text-white hover:bg-white/20 flex-shrink-0 ml-4"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Habit Details */}
                      <div className="p-6">
                        {/* Badges Row */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <Badge variant="outline" className={`${colors.text} border-current`}>
                            {getTimeOfDayEmoji(habit.timeOfDay)} {getTimeOfDayLabel(habit.timeOfDay)}
                          </Badge>
                          <Badge variant="outline" className="text-gray-600">
                            {habit.frequency}
                          </Badge>
                        </div>

                        {/* Progress Visualization - Vertical Layout */}
                        <div className="space-y-6">
                          {/* Large Progress Ring - Centered */}
                          <div className="flex justify-center">
                            <div className="relative">
                              <div className="relative w-32 h-32">
                                <svg className="w-32 h-32 transform -rotate-90">
                                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                                  <circle 
                                    cx="64" 
                                    cy="64" 
                                    r="56" 
                                    stroke={colors.bg.includes('indigo') ? '#6366f1' : colors.bg.includes('amber') ? '#f59e0b' : '#10b981'} 
                                    strokeWidth="8" 
                                    fill="none" 
                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (progressPercentage / 100))}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 drop-shadow-lg"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</div>
                                    <div className="text-sm text-gray-500">complete</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Progress Info - Centered */}
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {habit.streak}/67 Days
                            </div>
                            <div className="text-sm text-gray-500">
                              {habit.streak < 67 ? `${67 - habit.streak} days to mastery` : "Habit mastered!"}
                            </div>
                          </div>
                          
                          {/* Slide to Complete Interface */}
                          <div className="space-y-4">
                            {!habit.completedToday ? (
                              <SlideToComplete
                                onComplete={() => handleToggleHabit(habit.id)}
                                disabled={toggleHabitMutation.isPending}
                                colors={{
                                  bg: colors.bg,
                                  stroke: colors.bg.includes('indigo') ? '#6366f1' : colors.bg.includes('amber') ? '#f59e0b' : '#10b981',
                                  text: colors.text
                                }}
                              />
                            ) : (
                              <div className={`${colors.bg} rounded-xl py-4 px-6 flex items-center justify-center`}>
                                <div className="flex items-center gap-3 text-white">
                                  <CheckCircle2 className="w-6 h-6" />
                                  <span className="font-bold text-lg">COMPLETED TODAY</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-700"
                                style={{ 
                                  width: `${progressPercentage}%`,
                                  backgroundColor: colors.bg.includes('indigo') ? '#6366f1' : colors.bg.includes('amber') ? '#f59e0b' : '#10b981'
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Formation Stage Indicator */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {habit.streak <= 18 ? "🌱 Initial Formation" :
                                   habit.streak <= 45 ? "💪 Strengthening" :
                                   habit.streak < 67 ? "🧠 Automaticity" : "🎉 Mastery + Bonus"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {habit.streak <= 18 ? "Building awareness & momentum" :
                                   habit.streak <= 45 ? "Developing neural pathways" :
                                   habit.streak < 67 ? "Becoming automatic" : "Habit mastered with .uoY bonus!"}
                                </div>
                              </div>
                              <div className="text-2xl">
                                {Math.round(progressPercentage)}%
                              </div>
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