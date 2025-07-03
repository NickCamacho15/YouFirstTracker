import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, CheckCircle2, Circle, Flame, Star, Zap, BarChart3, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HabitFormationTracker } from "@/components/habits/habit-formation-tracker";
import { FoundationsDashboard } from "@/components/habits/foundations-dashboard-large";
import { EditHabitModal } from "@/components/habits/edit-habit-modal";
import { SlideToComplete } from "@/components/habits/slide-to-complete";
import { HabitRadarChart } from "@/components/habits/habit-radar-chart";
import { SlideToBreak } from "@/components/habits/slide-to-break";

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
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <Tabs defaultValue="formation" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="formation" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                New habits
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

            <TabsContent value="formation" className="space-y-6">
              {/* Dismissible 67-Day Formation Info */}
              {showFormationInfo && (
                <Card className="border-0 shadow-lg bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">67-Day Formation Science</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Research shows it takes 66 days on average to form a habit. We give you an extra day for .uoY excellence. 
                            Track your progress through three key stages: Initial Formation (1-18), Strengthening (19-45), and Automaticity (46-67).
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowFormationInfo(false)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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

              {/* Compact Habit Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {(habits as Habit[]).map((habit) => {
                  const colors = getCategoryColors(habit.category);
                  const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
                  
                  return (
                    <Card key={habit.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="text-center mb-3">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle 
                                cx="32" 
                                cy="32" 
                                r="28" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                fill="none" 
                                className="text-gray-200" 
                              />
                              <circle 
                                cx="32" 
                                cy="32" 
                                r="28" 
                                stroke={colors.text.includes('blue') ? '#3b82f6' : colors.text.includes('orange') ? '#f59e0b' : '#10b981'}
                                strokeWidth="4" 
                                fill="none" 
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-700"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{habit.streak}</span>
                            </div>
                          </div>
                          <h4 className="font-semibold text-sm mb-1 line-clamp-2">{habit.title}</h4>
                          <div className="text-xs text-muted-foreground">{habit.streak}/67 days</div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs mt-2 ${colors.light}`}
                          >
                            {habit.category === 'mind' ? '🧠' : habit.category === 'body' ? '💪' : '✨'} {habit.category}
                          </Badge>
                        </div>
                        <SlideToComplete
                          onComplete={() => handleToggleHabit(habit.id)}
                          completed={habit.completedToday}
                          disabled={toggleHabitMutation.isPending}
                          habitTitle={habit.title}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHabit(habit)}
                          className="w-full mt-2 text-xs"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
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

                  {/* Rules List */}
                  <div className="space-y-3">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          rule.completedToday 
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                            : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleRuleCompletion(rule.id)}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  rule.completedToday 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}>
                                  {rule.completedToday && (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                </div>
                                <span className={`font-semibold ${rule.completedToday ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {rule.text}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {rule.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className={rule.completedToday ? 'text-green-600' : 'text-gray-500'}>
                                {rule.completedToday ? '✅ Promise kept today' : `🔄 ${rule.streak} day streak`}
                              </span>
                              {rule.failures > 0 && (
                                <span className="text-red-500 text-xs">
                                  ⚠️ {rule.failures} failures tracked
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markRuleFailure(rule.id)}
                              className="text-orange-400 hover:text-orange-600"
                              title="Mark failure"
                            >
                              ⚠️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
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