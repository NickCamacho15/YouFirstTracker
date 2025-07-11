import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, CheckCircle2, Circle, Flame, Star, Zap, BarChart3, Shield, X, Layers, Trophy, Coffee, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HabitFormationTracker } from "@/components/habits/habit-formation-tracker";
import { FoundationsDashboard } from "@/components/habits/foundations-dashboard-clean";
import { RulesDashboard } from "@/components/habits/rules-dashboard-clean";
import { EditHabitModal } from "@/components/habits/edit-habit-modal";
import { SlideToComplete } from "@/components/habits/slide-to-complete";
import { HabitRadarChart } from "@/components/habits/habit-radar-chart";
import { SlideToBreak } from "@/components/habits/slide-to-break";
import { NewHabitModal } from "@/components/habits/new-habit-modal";
import { IndividualHabitProgress } from "@/components/habits/individual-habit-progress";

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
    default: return '⏰';
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
  const [showFormationInfo, setShowFormationInfo] = useState(true);
  const [showFormationScience, setShowFormationScience] = useState(true);
  const [rules, setRules] = useState([
    { id: 1, text: "No social media before 10 AM", violated: false, streak: 12, category: "Digital Wellness", completedToday: true, failures: 2 },
    { id: 2, text: "No processed food on weekdays", violated: false, streak: 8, category: "Nutrition", completedToday: true, failures: 0 },
    { id: 3, text: "No screens 1 hour before bed", violated: true, streak: 0, category: "Sleep Hygiene", completedToday: false, failures: 5 },
    { id: 4, text: "No negative self-talk", violated: false, streak: 5, category: "Mental Health", completedToday: true, failures: 1 },
    { id: 5, text: "No skipping workouts without valid reason", violated: false, streak: 15, category: "Fitness", completedToday: true, failures: 0 },
  ]);
  const [newRule, setNewRule] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState("Personal");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading, error } = useQuery({
    queryKey: ['/api/habits'],
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId }: { habitId: number }) => {
      const response = await apiRequest('POST', `/api/habits/${habitId}/toggle`);
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
      console.error("Toggle habit error:", error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    },
  });

  const handleToggleHabit = (habitId: number) => {
    toggleHabitMutation.mutate({ habitId });
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditHabitModalOpen(true);
  };

  // Rules functions

  const handleAddRule = () => {
    if (newRule.trim()) {
      const newRuleObj = {
        id: Math.max(...rules.map(r => r.id), 0) + 1,
        text: newRule.trim(),
        violated: false,
        streak: 0,
        category: newRuleCategory,
        completedToday: false,
        failures: 0
      };
      setRules(prev => [...prev, newRuleObj]);
      setNewRule("");
      toast({
        title: "Success",
        description: "New rule added successfully",
      });
    }
  };

  const handleDeleteRule = (ruleId: number) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Success", 
      description: "Rule deleted successfully",
    });
  };

  const toggleRuleCompletion = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { 
            ...rule, 
            completedToday: !rule.completedToday,
            streak: !rule.completedToday ? rule.streak + 1 : Math.max(0, rule.streak - 1)
          }
        : rule
    ));
    
    const rule = rules.find(r => r.id === id);
    if (rule) {
      toast({
        title: rule.completedToday ? "Promise broken today" : "Promise kept!",
        description: rule.completedToday ? "Reset your commitment tomorrow" : "Building integrity, one day at a time",
      });
    }
  };

  const breakRule = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { 
            ...rule, 
            completedToday: false,
            violated: true,
            streak: 0,
            failures: rule.failures + 1
          }
        : rule
    ));
    
    const rule = rules.find(r => r.id === id);
    if (rule) {
      toast({
        title: "Promise broken",
        description: `"${rule.text}" - Tomorrow is a fresh start to rebuild integrity`,
        variant: "destructive",
      });
    }
  };

  const markRuleFailure = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { 
            ...rule, 
            failures: rule.failures + 1
          }
        : rule
    ));
    
    const rule = rules.find(r => r.id === id);
    if (rule) {
      toast({
        title: "Failure recorded",
        description: `"${rule.text}" - Tracking for growth and awareness`,
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading habits</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <Tabs defaultValue="rituals" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="rituals" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Rituals
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rituals" className="space-y-6">
              {/* Morning Routine */}
              <Card className="border-0 shadow-lg relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      <CardTitle className="text-base sm:text-lg">Morning Routine</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50"
                      onClick={() => {/* Add morning routine item */}}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Start your day with purpose
                  </p>
                  
                  {/* Discipline Metrics Bar */}
                  <div className="bg-amber-50 rounded-lg p-3 mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-amber-800">Today's Progress</span>
                      <span className="text-xs font-bold text-amber-800">75%</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-green-600">3</div>
                        <div className="text-gray-600">On Track</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">12</div>
                        <div className="text-gray-600">Avg Streak</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[
                      { id: 'morning-1', text: 'Meditation (10 min)', completed: true, streak: 12 },
                      { id: 'morning-2', text: 'Exercise', completed: false, streak: 8 },
                      { id: 'morning-3', text: 'Healthy breakfast', completed: false, streak: 15 },
                      { id: 'morning-4', text: 'Review daily priorities', completed: false, streak: 6 }
                    ].map((routine) => (
                      <div 
                        key={routine.id}
                        className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                          routine.completed ? 'bg-amber-50 border-amber-200' : 'border-gray-200 hover:bg-amber-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={routine.completed}
                          onChange={() => {}}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 rounded cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs sm:text-sm ${routine.completed ? 'text-amber-800 font-medium' : 'text-gray-700'}`}>
                            {routine.text}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              routine.streak >= 7 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {routine.streak} day streak
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Evening Routine */}
              <Card className="border-0 shadow-lg relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      <CardTitle className="text-base sm:text-lg">Evening Routine</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {/* Add evening routine item */}}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    End your day with reflection
                  </p>
                  
                  {/* Discipline Metrics Bar */}
                  <div className="bg-indigo-50 rounded-lg p-3 mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-indigo-800">Today's Progress</span>
                      <span className="text-xs font-bold text-indigo-800">50%</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: '50%' }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-green-600">2</div>
                        <div className="text-gray-600">On Track</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">10</div>
                        <div className="text-gray-600">Avg Streak</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[
                      { id: 'evening-1', text: 'Daily reflection', completed: false, streak: 9 },
                      { id: 'evening-2', text: 'Reading (30 min)', completed: false, streak: 11 },
                      { id: 'evening-3', text: 'Prepare tomorrow', completed: false, streak: 4 },
                      { id: 'evening-4', text: 'Gratitude practice', completed: false, streak: 14 }
                    ].map((routine) => (
                      <div 
                        key={routine.id}
                        className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                          routine.completed ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-indigo-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={routine.completed}
                          onChange={() => {}}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs sm:text-sm ${routine.completed ? 'text-indigo-800 font-medium' : 'text-gray-700'}`}>
                            {routine.text}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              routine.streak >= 7 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {routine.streak} day streak
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Habit Progress Bars */}
              <IndividualHabitProgress habits={habits as Habit[]} />

              {/* New Habits Section with Mind/Body/Soul Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                
                {/* Mind Category */}
                <Card className="border-0 shadow-lg relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs">🧠</span>
                        </div>
                        <CardTitle className="text-base sm:text-lg">Mind Habits</CardTitle>
                      </div>
                      <NewHabitModal 
                        category="mind"
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        }
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Strengthen mental clarity and focus
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="bg-blue-50 rounded-lg p-3 mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-blue-800">67-Day Formation</span>
                        <span className="text-xs font-bold text-blue-800">
                          {Math.round(((habits as Habit[]).filter(h => h.category === 'mind' && h.completedToday).length / Math.max(1, (habits as Habit[]).filter(h => h.category === 'mind').length)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round(((habits as Habit[]).filter(h => h.category === 'mind' && h.completedToday).length / Math.max(1, (habits as Habit[]).filter(h => h.category === 'mind').length)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {(habits as Habit[]).filter(h => h.category === 'mind' && h.streak >= 7).length}
                          </div>
                          <div className="text-gray-600">Forming</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-600">
                            {(habits as Habit[]).filter(h => h.category === 'mind').length > 0 
                              ? Math.round((habits as Habit[]).filter(h => h.category === 'mind').reduce((acc, h) => acc + h.streak, 0) / (habits as Habit[]).filter(h => h.category === 'mind').length) 
                              : 0}
                          </div>
                          <div className="text-gray-600">Avg Days</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {(habits as Habit[]).filter(h => h.category === 'mind').map((habit) => (
                        <div 
                          key={habit.id}
                          className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                            habit.completedToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-blue-50'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={habit.completedToday}
                            onChange={() => handleToggleHabit(habit.id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                habit.streak >= 67
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                                  : habit.streak >= 30
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {habit.streak}/67 days
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(habits as Habit[]).filter(h => h.category === 'mind').length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No mind habits yet. Add one to start building mental clarity!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Body Category */}
                <Card className="border-0 shadow-lg relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                          <span className="text-white text-xs">💪</span>
                        </div>
                        <CardTitle className="text-base sm:text-lg">Body Habits</CardTitle>
                      </div>
                      <NewHabitModal 
                        category="body"
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        }
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Build physical strength and vitality
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="bg-orange-50 rounded-lg p-3 mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-orange-800">67-Day Formation</span>
                        <span className="text-xs font-bold text-orange-800">
                          {Math.round(((habits as Habit[]).filter(h => h.category === 'body' && h.completedToday).length / Math.max(1, (habits as Habit[]).filter(h => h.category === 'body').length)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round(((habits as Habit[]).filter(h => h.category === 'body' && h.completedToday).length / Math.max(1, (habits as Habit[]).filter(h => h.category === 'body').length)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {(habits as Habit[]).filter(h => h.category === 'body' && h.streak >= 7).length}
                          </div>
                          <div className="text-gray-600">Forming</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-orange-600">
                            {(habits as Habit[]).filter(h => h.category === 'body').length > 0 
                              ? Math.round((habits as Habit[]).filter(h => h.category === 'body').reduce((acc, h) => acc + h.streak, 0) / (habits as Habit[]).filter(h => h.category === 'body').length) 
                              : 0}
                          </div>
                          <div className="text-gray-600">Avg Days</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {(habits as Habit[]).filter(h => h.category === 'body').map((habit) => (
                        <div 
                          key={habit.id}
                          className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                            habit.completedToday ? 'bg-orange-50 border-orange-200' : 'border-gray-200 hover:bg-orange-50'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={habit.completedToday}
                            onChange={() => handleToggleHabit(habit.id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 rounded cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-orange-800 font-medium' : 'text-gray-700'}`}>
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                habit.streak >= 67
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                                  : habit.streak >= 30
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {habit.streak}/67 days
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(habits as Habit[]).filter(h => h.category === 'body').length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No body habits yet. Add one to start building physical strength!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Soul Category */}
                <Card className="border-0 shadow-lg relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white text-xs">✨</span>
                        </div>
                        <CardTitle className="text-base sm:text-lg">Soul Habits</CardTitle>
                      </div>
                      <NewHabitModal 
                        category="soul"
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        }
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Nurture spiritual growth and purpose
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="bg-emerald-50 rounded-lg p-3 mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-emerald-800">67-Day Formation</span>
                        <span className="text-xs font-bold text-emerald-800">
                          {Math.round(((habits as Habit[]).filter(h => h.category === 'soul' && h.completedToday).length / Math.max(1, (habits as Habit[]).filter(h => h.category === 'soul').length)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round(((habits as Habit[]).filter(h => h.category === 'soul' && h.completedToday).length / Math.max(1, (habits as Habit[]).filter(h => h.category === 'soul').length)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {(habits as Habit[]).filter(h => h.category === 'soul' && h.streak >= 7).length}
                          </div>
                          <div className="text-gray-600">Forming</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-emerald-600">
                            {(habits as Habit[]).filter(h => h.category === 'soul').length > 0 
                              ? Math.round((habits as Habit[]).filter(h => h.category === 'soul').reduce((acc, h) => acc + h.streak, 0) / (habits as Habit[]).filter(h => h.category === 'soul').length) 
                              : 0}
                          </div>
                          <div className="text-gray-600">Avg Days</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {(habits as Habit[]).filter(h => h.category === 'soul').map((habit) => (
                        <div 
                          key={habit.id}
                          className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                            habit.completedToday ? 'bg-emerald-50 border-emerald-200' : 'border-gray-200 hover:bg-emerald-50'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={habit.completedToday}
                            onChange={() => handleToggleHabit(habit.id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 rounded cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-emerald-800 font-medium' : 'text-gray-700'}`}>
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                habit.streak >= 67
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                                  : habit.streak >= 30
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {habit.streak}/67 days
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(habits as Habit[]).filter(h => h.category === 'soul').length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No soul habits yet. Add one to start nurturing your spiritual growth!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mastered Habits Section (67+ days) */}
              {(habits as Habit[]).some(h => h.streak >= 67) && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-yellow-800">Mastered Habits</CardTitle>
                          <p className="text-sm text-yellow-700">Congratulations! These habits are now automatic</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
                        {(habits as Habit[]).filter(h => h.streak >= 67).length} mastered
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(habits as Habit[]).filter(h => h.streak >= 67).map((habit) => {
                        const categoryColors = {
                          mind: 'bg-blue-100 text-blue-800 border-blue-300',
                          body: 'bg-orange-100 text-orange-800 border-orange-300',
                          soul: 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        };
                        
                        const categoryIcons = {
                          mind: '🧠',
                          body: '💪',
                          soul: '✨'
                        };
                        
                        return (
                          <div 
                            key={habit.id}
                            className="bg-white rounded-lg p-4 border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {categoryIcons[habit.category as keyof typeof categoryIcons]}
                                </span>
                                <span className="font-medium text-gray-900">{habit.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                                <span className="text-xs font-bold text-yellow-700">{habit.streak} days</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge 
                                className={`text-xs ${categoryColors[habit.category as keyof typeof categoryColors]}`}
                              >
                                {habit.category?.charAt(0).toUpperCase()}{habit.category?.slice(1)}
                              </Badge>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Mastered</span>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

            </TabsContent>

            <TabsContent value="foundations">
              <FoundationsDashboard 
                habits={habits as Habit[]} 
                onToggleHabit={handleToggleHabit}
                onEditHabit={handleEditHabit}
                isLoading={toggleHabitMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <RulesDashboard
                rules={rules}
                onToggleRuleCompletion={toggleRuleCompletion}
                onMarkRuleFailure={markRuleFailure}
                onAddRule={handleAddRule}
                isLoading={false}
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
