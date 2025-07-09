import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, CheckCircle2, Circle, Flame, Star, Zap, BarChart3, Shield, X, Layers, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HabitFormationTracker } from "@/components/habits/habit-formation-tracker";
import { FoundationsDashboard } from "@/components/habits/foundations-dashboard-clean";
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
          <Tabs defaultValue="new-habits" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="new-habits" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                New Habits
              </TabsTrigger>
              <TabsTrigger value="foundations" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Foundations
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-habits" className="space-y-6">
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

            <TabsContent value="formation" className="space-y-6">
              {/* Fitness-Style Analytics Dashboard for New Habits */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-8 text-white mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-black mb-2">HABIT FORMATION</h1>
                    <p className="text-gray-300">67-day transformation tracking</p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 text-sm font-bold tracking-wide">FORMATION RATE</div>
                    <div className="text-5xl font-black text-white">
                      {habits.length > 0 ? Math.round((habits.filter(h => h.streak >= 21).length / habits.length) * 100) : 0}
                    </div>
                    <div className="text-blue-400 text-sm">BUILDING</div>
                  </div>
                </div>
                
                {/* Key Metrics Row */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-green-400 text-2xl font-black">
                      {habits.filter(h => h.streak >= 67).length}
                    </div>
                    <div className="text-gray-300 text-xs font-medium">MASTERED</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-yellow-400 text-2xl font-black">
                      {habits.filter(h => h.streak >= 21 && h.streak < 67).length}
                    </div>
                    <div className="text-gray-300 text-xs font-medium">FORMING</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-orange-400 text-2xl font-black">
                      {habits.filter(h => h.streak < 21).length}
                    </div>
                    <div className="text-gray-300 text-xs font-medium">STARTING</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="text-purple-400 text-2xl font-black">
                      {habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) : 0}
                    </div>
                    <div className="text-gray-300 text-xs font-medium">AVG DAYS</div>
                  </div>
                </div>
              </div>

              {/* Scientific Habit Formation Overview */}
              {showFormationScience && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">67-Day Formation Science</CardTitle>
                          <p className="text-sm text-muted-foreground">Research-backed habit formation with bonus day for .uoY</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowFormationScience(false)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
              )}

              {/* Enhanced Habit Tiles with Clear Reminder/Routine/Reward */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {(habits as Habit[]).map((habit) => {
                  const colors = getCategoryColors(habit.category);
                  const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
                  
                  return (
                    <Card key={habit.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                      <CardContent className="p-6">
                        {/* Header with Category and Progress */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              habit.category === 'mind' ? 'bg-purple-500' : 
                              habit.category === 'body' ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}>
                              <span className="text-2xl">
                                {habit.category === 'mind' ? '🧠' : habit.category === 'body' ? '💪' : '✨'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{habit.title}</h3>
                              <p className="text-sm text-gray-600 capitalize">{habit.category} • {habit.streak}/67 days</p>
                            </div>
                          </div>
                          
                          {/* Large Progress Circle */}
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                                className={habit.category === 'mind' ? 'text-purple-500' : 
                                          habit.category === 'body' ? 'text-orange-500' : 'text-emerald-500'}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900">{habit.streak}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reminder, Routine, Reward Framework */}
                        <div className="space-y-4 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">R</span>
                              </div>
                              <h4 className="font-semibold text-blue-900">Reminder</h4>
                            </div>
                            <p className="text-sm text-blue-800">
                              {habit.timeOfDay ? `${habit.timeOfDay}` : 'Set your reminder time'}
                              {habit.description && ` • ${habit.description}`}
                            </p>
                          </div>
                          
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">R</span>
                              </div>
                              <h4 className="font-semibold text-green-900">Routine</h4>
                            </div>
                            <p className="text-sm text-green-800 font-medium">
                              {habit.title}
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              {habit.frequency || 'Daily practice'}
                            </p>
                          </div>
                          
                          <div className="bg-amber-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">R</span>
                              </div>
                              <h4 className="font-semibold text-amber-900">Reward</h4>
                            </div>
                            <p className="text-sm text-amber-800">
                              {habit.streak > 0 ? `${habit.streak} day streak!` : 'Build your first streak'}
                              {habit.streak >= 7 && ' ⭐'}
                              {habit.streak >= 30 && ' 🏆'}
                            </p>
                          </div>
                        </div>

                        {/* Completion Button */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleToggleHabit(habit.id)}
                            disabled={toggleHabitMutation.isPending}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-center transition-colors duration-200 ${
                              habit.completedToday
                                ? `${habit.category === 'mind' ? 'bg-purple-500' : 
                                     habit.category === 'body' ? 'bg-orange-500' : 'bg-emerald-500'
                                   } text-white`
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {habit.completedToday ? (
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Completed Today
                              </div>
                            ) : (
                              'Mark Complete'
                            )}
                          </button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditHabit(habit)}
                            className="px-4"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Full Formation Tracker */}
              <HabitFormationTracker habits={habits as Habit[]} />
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
              {/* Rules Commitment Dashboard */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Rules of Negation</CardTitle>
                        <p className="text-sm text-muted-foreground">What you're cutting yourself off from for transformation</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{rules.filter(r => !r.violated).length}</div>
                      <div className="text-xs text-blue-600">Active Rules</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Fitness-Style Analytics Dashboard */}
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-8 text-white mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-black mb-2">DISCIPLINE METRICS</h2>
                        <p className="text-gray-300">Behavioral optimization tracking</p>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 text-sm font-bold tracking-wide">WILLPOWER SCORE</div>
                        <div className="text-5xl font-black text-white">
                          {Math.round((rules.filter(r => !r.violated).length / rules.length) * 100)}
                        </div>
                        <div className="text-red-400 text-sm">ELITE</div>
                      </div>
                    </div>
                    
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="text-yellow-400 text-2xl font-black">
                          {Math.max(...rules.map(r => r.streak))}
                        </div>
                        <div className="text-gray-300 text-xs font-medium">MAX STREAK</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="text-green-400 text-2xl font-black">
                          {rules.filter(r => r.completedToday).length}
                        </div>
                        <div className="text-gray-300 text-xs font-medium">TODAY</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="text-purple-400 text-2xl font-black">
                          {rules.reduce((sum, r) => sum + r.failures, 0)}
                        </div>
                        <div className="text-gray-300 text-xs font-medium">FAILURES</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="text-blue-400 text-2xl font-black">
                          {Math.round(rules.reduce((sum, r) => sum + r.streak, 0) / rules.length)}
                        </div>
                        <div className="text-gray-300 text-xs font-medium">AVG STREAK</div>
                      </div>
                    </div>
                  </div>

                  {/* Recovery Zone Performance Chart */}
                  <div className="bg-black rounded-3xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-bold">7-DAY DISCIPLINE</h3>
                      <div className="text-green-400 text-sm font-medium">OPTIMAL ZONE</div>
                    </div>
                    
                    <div className="relative h-40">
                      <svg className="w-full h-full" viewBox="0 0 400 160">
                        {/* Performance zone backgrounds */}
                        <rect x="0" y="0" width="400" height="32" fill="#ef4444" opacity="0.1"/>
                        <rect x="0" y="32" width="400" height="32" fill="#f97316" opacity="0.1"/>
                        <rect x="0" y="64" width="400" height="32" fill="#eab308" opacity="0.1"/>
                        <rect x="0" y="96" width="400" height="32" fill="#22c55e" opacity="0.1"/>
                        <rect x="0" y="128" width="400" height="32" fill="#06b6d4" opacity="0.1"/>
                        
                        {/* Grid lines */}
                        {[0, 32, 64, 96, 128, 160].map((y) => (
                          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#374151" strokeWidth="0.5"/>
                        ))}
                        
                        {/* Discipline performance line */}
                        {Array.from({ length: 7 }, (_, i) => {
                          const performance = Math.random() * 80 + 20; // Mock 7-day data
                          return (
                            <circle
                              key={i}
                              cx={(i * 400) / 6}
                              cy={160 - (performance * 160) / 100}
                              r="4"
                              fill="#22c55e"
                              stroke="#000"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </svg>
                      
                      {/* Zone labels */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-16">
                        <span className="text-red-400">FAIL</span>
                        <span className="text-orange-400">WEAK</span>
                        <span className="text-yellow-400">AVG</span>
                        <span className="text-green-400">GOOD</span>
                        <span className="text-cyan-400">ELITE</span>
                      </div>
                    </div>
                    
                    {/* Day labels */}
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <span key={i} className="text-center">{day}</span>
                      ))}
                    </div>
                  </div>

                  {/* 1000-Day Vision */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">1000-Day Transformation Vision</h3>
                        <p className="text-xs text-muted-foreground">Who you become through consistent negation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500">
                        <div className="font-medium text-amber-600">Year 1 (365 days)</div>
                        <div className="text-muted-foreground">New patterns established, old triggers identified</div>
                      </div>
                      <div className="bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500">
                        <div className="font-medium text-amber-600">Year 2-3 (730 days)</div>
                        <div className="text-muted-foreground">Deep rewiring, automatic resistance to old patterns</div>
                      </div>
                      <div className="bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500">
                        <div className="font-medium text-amber-600">1000 Days</div>
                        <div className="text-muted-foreground">Complete identity shift, unshakeable self-mastery</div>
                      </div>
                    </div>
                  </div>

                  {/* Philosophy */}
                  <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-800 dark:text-gray-200 text-center">
                      <strong>Commitment over Perfection:</strong> You will break these rules. That's human. 
                      What matters is your commitment to return to the path immediately. Recovery speed, not perfection, builds character.
                    </p>
                  </div>

                  {/* Add New Rule */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3">Add New Rule</h3>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="No social media before..."
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                      />
                      <select
                        value={newRuleCategory}
                        onChange={(e) => setNewRuleCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="Digital Wellness">Digital Wellness</option>
                        <option value="Nutrition">Nutrition</option>
                        <option value="Sleep Hygiene">Sleep Hygiene</option>
                        <option value="Mental Health">Mental Health</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Personal">Personal</option>
                      </select>
                      <Button onClick={handleAddRule} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rules Categories */}
                  <div className="space-y-6">
                    {/* Digital Wellness Category */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">📱</span>
                        Digital Wellness
                      </h3>
                      <div className="space-y-3">
                        {rules.filter(rule => rule.category === 'Digital Wellness').map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              rule.completedToday 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                                : 'bg-white border-gray-200 hover:border-blue-300 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`font-medium ${rule.completedToday ? 'text-green-700' : 'text-gray-900'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => markRuleFailure(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold"
                              >
                                BROKE RULE
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={rule.completedToday ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept' : `🔥 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                  ⚠️ {rule.failures} breaks
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Category */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        Nutrition
                      </h3>
                      <div className="space-y-3">
                        {rules.filter(rule => rule.category === 'Nutrition').map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              rule.completedToday 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                                : 'bg-white border-gray-200 hover:border-orange-300 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`font-medium ${rule.completedToday ? 'text-green-700' : 'text-gray-900'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => markRuleFailure(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold"
                              >
                                BROKE RULE
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={rule.completedToday ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept' : `🔥 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                  ⚠️ {rule.failures} breaks
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sleep Hygiene Category */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">😴</span>
                        Sleep Hygiene
                      </h3>
                      <div className="space-y-3">
                        {rules.filter(rule => rule.category === 'Sleep Hygiene').map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              rule.completedToday 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                                : 'bg-white border-gray-200 hover:border-purple-300 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`font-medium ${rule.completedToday ? 'text-green-700' : 'text-gray-900'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => markRuleFailure(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold"
                              >
                                BROKE RULE
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={rule.completedToday ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept' : `🔥 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                  ⚠️ {rule.failures} breaks
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mental Health Category */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        Mental Health
                      </h3>
                      <div className="space-y-3">
                        {rules.filter(rule => rule.category === 'Mental Health').map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              rule.completedToday 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                                : 'bg-white border-gray-200 hover:border-indigo-300 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`font-medium ${rule.completedToday ? 'text-green-700' : 'text-gray-900'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => markRuleFailure(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold"
                              >
                                BROKE RULE
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={rule.completedToday ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept' : `🔥 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                  ⚠️ {rule.failures} breaks
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fitness Category */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">💪</span>
                        Fitness
                      </h3>
                      <div className="space-y-3">
                        {rules.filter(rule => rule.category === 'Fitness').map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              rule.completedToday 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                                : 'bg-white border-gray-200 hover:border-red-300 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`font-medium ${rule.completedToday ? 'text-green-700' : 'text-gray-900'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => markRuleFailure(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold"
                              >
                                BROKE RULE
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={rule.completedToday ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept' : `🔥 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                  ⚠️ {rule.failures} breaks
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personal Category */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Personal
                      </h3>
                      <div className="space-y-3">
                        {rules.filter(rule => rule.category === 'Personal').map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              rule.completedToday 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                                : 'bg-white border-gray-200 hover:border-pink-300 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`font-medium ${rule.completedToday ? 'text-green-700' : 'text-gray-900'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => markRuleFailure(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-bold"
                              >
                                BROKE RULE
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={rule.completedToday ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept' : `🔥 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs font-medium">
                                  ⚠️ {rule.failures} breaks
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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