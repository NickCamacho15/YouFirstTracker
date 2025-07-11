import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, CheckCircle2, Circle, Flame, Star, Zap, BarChart3, Shield, X, Layers, Trophy, Coffee, Moon, Target, ChevronUp } from "lucide-react";
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="rituals" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Rituals
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="challenge" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Challenge
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

              {/* Active Data Display for Long-term Completion and Adherence */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Ritual Mastery Dashboard</CardTitle>
                        <p className="text-sm text-gray-600">Long-term completion and adherence tracking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {(habits as Habit[]).filter(h => h.streak >= 30).length} mastered
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Overall Completion Rate */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(((habits as Habit[]).filter(h => h.completedToday).length / Math.max(1, (habits as Habit[]).length)) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Daily Completion</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round(((habits as Habit[]).filter(h => h.completedToday).length / Math.max(1, (habits as Habit[]).length)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Average Streak */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(habits as Habit[]).length > 0 
                          ? Math.round((habits as Habit[]).reduce((acc, h) => acc + h.streak, 0) / (habits as Habit[]).length) 
                          : 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Average Streak</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Flame className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600">days</span>
                      </div>
                    </div>

                    {/* Consistency Score */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(((habits as Habit[]).filter(h => h.streak >= 7).length / Math.max(1, (habits as Habit[]).length)) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Consistency Score</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-gray-600">7+ day streaks</span>
                      </div>
                    </div>

                    {/* Total Active Rituals */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(habits as Habit[]).length}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Active Rituals</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-600">in progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Progress Chart */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Weekly Adherence Pattern</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                        const completionRate = Math.floor(Math.random() * 100) + 1; // Mock data - replace with real calculation
                        return (
                          <div key={day} className="text-center">
                            <div className="text-xs text-gray-600 mb-1">{day}</div>
                            <div className="h-16 bg-gray-200 rounded relative">
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded transition-all duration-300"
                                style={{ height: `${completionRate}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{completionRate}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Progress Trend */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Monthly Trend</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">89%</div>
                          <p className="text-xs text-gray-600">This Month</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">+12%</div>
                          <p className="text-xs text-gray-600">vs Last Month</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">24</div>
                          <p className="text-xs text-gray-600">Best Streak</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Improving</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

            <TabsContent value="challenge" className="space-y-6">
              {/* Active Challenges */}
              <div className="space-y-4">
                {/* Challenge Header */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold">75-100 Day Challenges</CardTitle>
                        <p className="text-purple-100 mt-1">Push your limits with extended commitment challenges</p>
                      </div>
                      <Button 
                        variant="secondary"
                        className="bg-white text-purple-600 hover:bg-purple-50"
                        onClick={() => {/* Add new challenge */}}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Challenge
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Example Challenge - 75 Hard */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">75 Hard Challenge</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Mental toughness program • Day 23 of 75</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">30%</div>
                        <p className="text-xs text-gray-500">Complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Daily Tasks */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Today's Requirements:</h4>
                      <div className="space-y-2">
                        {[
                          { task: "Workout #1 (45 min)", completed: true },
                          { task: "Workout #2 (45 min outdoor)", completed: false },
                          { task: "Follow diet plan", completed: true },
                          { task: "Drink 1 gallon of water", completed: true },
                          { task: "Read 10 pages", completed: false },
                          { task: "Take progress photo", completed: true }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {}}
                              className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                            />
                            <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Grid */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Progress Tracker:</h4>
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 75 }, (_, i) => {
                          const dayNumber = i + 1;
                          const isCompleted = dayNumber <= 22;
                          const isToday = dayNumber === 23;
                          const isFuture = dayNumber > 23;
                          
                          return (
                            <div
                              key={i}
                              className={`
                                aspect-square rounded flex items-center justify-center text-xs font-medium
                                ${isCompleted ? 'bg-green-500 text-white' : ''}
                                ${isToday ? 'bg-purple-500 text-white ring-2 ring-purple-300' : ''}
                                ${isFuture ? 'bg-gray-100 text-gray-400' : ''}
                              `}
                            >
                              {dayNumber}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Example Challenge - 100 Days of Code */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">100 Days of Code</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Code for at least 1 hour daily • Day 45 of 100</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">45%</div>
                        <p className="text-xs text-gray-500">Complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Daily Task */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => {}}
                            className="w-6 h-6 text-blue-600 rounded cursor-pointer"
                          />
                          <div>
                            <p className="font-medium text-gray-900">Code for 1+ hours</p>
                            <p className="text-sm text-gray-600">Work on personal project or tutorials</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Log Progress
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">45 / 100 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
