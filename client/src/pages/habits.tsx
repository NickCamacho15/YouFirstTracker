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
import { FoundationsDashboard } from "@/components/habits/foundations-dashboard";
import { EditHabitModal } from "@/components/habits/edit-habit-modal";
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
  const [rules, setRules] = useState([
    { id: 1, text: "No social media before 10 AM", violated: false, streak: 12, category: "Digital Wellness" },
    { id: 2, text: "No processed food on weekdays", violated: false, streak: 8, category: "Nutrition" },
    { id: 3, text: "No screens 1 hour before bed", violated: true, streak: 0, category: "Sleep Hygiene" },
    { id: 4, text: "No negative self-talk", violated: false, streak: 5, category: "Mental Health" },
    { id: 5, text: "No skipping workouts without valid reason", violated: false, streak: 15, category: "Fitness" },
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
      const response = await apiRequest(`/api/habits/${habitId}/toggle`, 'POST');
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
  const handleRuleViolation = (ruleId: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, violated: !rule.violated, streak: rule.violated ? 1 : 0 }
        : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    if (rule && !rule.violated) {
      toast({
        title: "Rule Broken",
        description: `You've marked "${rule.text}" as violated. Your streak has been reset.`,
        variant: "destructive",
      });
    }
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      const newRuleObj = {
        id: Math.max(...rules.map(r => r.id), 0) + 1,
        text: newRule.trim(),
        violated: false,
        streak: 0,
        category: newRuleCategory
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Habits
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your life through science-backed habit formation. Track your 67-day journey to automaticity and personal excellence.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <Tabs defaultValue="formation" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="formation" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Formation
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
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Rules of Negation</CardTitle>
                        <p className="text-sm text-muted-foreground">What you're cutting yourself off from for transformation</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{rules.filter(r => !r.violated).length}</div>
                      <div className="text-xs text-red-600">Active Rules</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Commitment Gamification Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🎯</span>
                        <span className="text-sm font-medium">Commitment Score</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((rules.filter(r => !r.violated).length / rules.length) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Overall integrity</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🔥</span>
                        <span className="text-sm font-medium">Longest Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.max(...rules.map(r => r.streak))} days
                      </div>
                      <div className="text-xs text-muted-foreground">Personal record</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💪</span>
                        <span className="text-sm font-medium">Recovery Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((rules.filter(r => r.violated && r.streak > 0).length / Math.max(rules.filter(r => r.violated).length, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Bounce back strength</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🎖️</span>
                        <span className="text-sm font-medium">Mastery Level</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {rules.filter(r => r.streak >= 30).length > 2 ? 'Elite' : 
                         rules.filter(r => r.streak >= 14).length > 1 ? 'Advanced' : 
                         rules.filter(r => r.streak >= 7).length > 0 ? 'Developing' : 'Beginner'}
                      </div>
                      <div className="text-xs text-muted-foreground">Current tier</div>
                    </div>
                  </div>

                  {/* 1000-Day Vision */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <h3 className="font-semibold text-amber-800 dark:text-amber-200">1000-Day Transformation Vision</h3>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Who you become through consistent negation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                        <div className="font-medium text-amber-800 dark:text-amber-200">Year 1 (365 days)</div>
                        <div className="text-amber-700 dark:text-amber-300">New patterns established, old triggers identified</div>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                        <div className="font-medium text-amber-800 dark:text-amber-200">Year 2-3 (730 days)</div>
                        <div className="text-amber-700 dark:text-amber-300">Deep rewiring, automatic resistance to old patterns</div>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                        <div className="font-medium text-amber-800 dark:text-amber-200">1000 Days</div>
                        <div className="text-amber-700 dark:text-amber-300">Complete identity shift, unshakeable self-mastery</div>
                      </div>
                    </div>
                  </div>

                  {/* Philosophy */}
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 dark:text-red-200 text-center">
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
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          rule.violated 
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
                            : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`font-semibold ${rule.violated ? 'line-through text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                {rule.text}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {rule.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className={rule.violated ? 'text-red-600' : 'text-green-600'}>
                                {rule.violated ? '❌ Violated' : `✅ ${rule.streak} days clean`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={rule.violated ? "default" : "destructive"}
                              size="sm"
                              onClick={() => handleRuleViolation(rule.id)}
                              className="text-xs"
                            >
                              {rule.violated ? 'Mark Fixed' : 'Mark Broken'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-red-600 hover:text-red-700"
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