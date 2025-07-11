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
    default: return 'Anytime';
  }
};

interface Rule {
  id: number;
  title: string;
  description?: string;
  completedToday: boolean;
  streak: number;
  category?: string;
  importance?: 'high' | 'medium' | 'low';
}

interface ChallengeData {
  id: number;
  title: string;
  description?: string;
  duration: number; // 75 or 100 days
  currentDay: number;
  startDate: string;
  completedDays: number[];
  category?: string;
  rules?: string[];
}

export default function HabitsPage() {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showHealthScore, setShowHealthScore] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedTab, setSelectedTab] = useState("rituals");
  const [activeChallenges, setActiveChallenges] = useState<ChallengeData[]>([]);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(75);
  const [challengeRules, setChallengeRules] = useState<string[]>([]);
  const [newChallengeRule, setNewChallengeRule] = useState("");
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading: isLoadingHabits } = useQuery({
    queryKey: ['/api/habits'],
    queryFn: () => apiRequest('/api/habits'),
    refetchInterval: 5000,
  });

  const { data: rules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ['/api/rules'],
    queryFn: () => apiRequest('/api/rules'),
    refetchInterval: 5000,
  });

  const toggleHabitMutation = useMutation({
    mutationFn: (habitId: number) => apiRequest(`/api/habits/${habitId}/toggle`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Habit updated!",
        description: "Keep building those positive routines.",
      });
    },
    onError: (error) => {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: number) => apiRequest(`/api/habits/${habitId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Habit deleted",
        description: "The habit has been removed.",
      });
    },
    onError: (error) => {
      console.error('Error deleting habit:', error);
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleHabit = (habitId: number) => {
    toggleHabitMutation.mutate(habitId);
  };

  const handleDeleteHabit = (habitId: number) => {
    deleteHabitMutation.mutate(habitId);
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsEditModalOpen(true);
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      console.log('Adding rule:', newRule);
      setNewRule("");
      setIsAddingRule(false);
    }
  };

  const toggleRuleCompletion = (ruleId: number) => {
    console.log('Toggling rule completion:', ruleId);
  };

  const markRuleFailure = (ruleId: number) => {
    console.log('Marking rule failure:', ruleId);
  };

  const handleChallengeCheckOff = (challengeId: number, day: number) => {
    setActiveChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId
          ? {
              ...challenge,
              completedDays: challenge.completedDays.includes(day)
                ? challenge.completedDays.filter(d => d !== day)
                : [...challenge.completedDays, day]
            }
          : challenge
      )
    );
  };

  const createChallenge = () => {
    if (!challengeTitle.trim()) return;
    
    const newChallenge: ChallengeData = {
      id: Date.now(),
      title: challengeTitle,
      description: challengeDescription,
      duration: challengeDuration,
      currentDay: 1,
      startDate: new Date().toISOString().split('T')[0],
      completedDays: [],
      rules: challengeRules
    };
    
    setActiveChallenges(prev => [...prev, newChallenge]);
    setChallengeTitle("");
    setChallengeDescription("");
    setChallengeRules([]);
    setIsCreatingChallenge(false);
    
    toast({
      title: "Challenge Created!",
      description: `Your ${challengeDuration}-day challenge has been started.`,
    });
  };

  if (isLoadingHabits || isLoadingRules) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Disciplines</h1>
            <p className="text-gray-600">Build character through daily commitment</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rituals" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
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
                    onClick={() => setIsCreatingChallenge(true)}
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Challenge
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Active Challenges List */}
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {challenge.currentDay}/{challenge.duration}
                      </div>
                      <p className="text-sm text-gray-600">Days</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Grid */}
                  <div className="grid grid-cols-10 gap-2 mb-4">
                    {Array.from({ length: challenge.duration }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        onClick={() => handleChallengeCheckOff(challenge.id, day)}
                        className={`
                          w-8 h-8 rounded text-xs font-medium border-2 transition-all duration-200
                          ${challenge.completedDays.includes(day)
                            ? 'bg-green-500 border-green-500 text-white'
                            : day <= challenge.currentDay
                              ? 'bg-gray-100 border-gray-300 hover:bg-green-100 hover:border-green-300'
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          }
                        `}
                        disabled={day > challenge.currentDay}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Challenge Rules */}
                  {challenge.rules && challenge.rules.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Challenge Rules:</h4>
                      <ul className="space-y-1">
                        {challenge.rules.map((rule, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Create Challenge Form */}
            {isCreatingChallenge && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Create New Challenge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      value={challengeTitle}
                      onChange={(e) => setChallengeTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter challenge title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={challengeDescription}
                      onChange={(e) => setChallengeDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      placeholder="Describe your challenge..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={challengeDuration}
                      onChange={(e) => setChallengeDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={75}>75 Days</option>
                      <option value={100}>100 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge Rules
                    </label>
                    <div className="space-y-2">
                      {challengeRules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{rule}</span>
                          <button
                            onClick={() => setChallengeRules(challengeRules.filter((_, i) => i !== index))}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newChallengeRule}
                          onChange={(e) => setNewChallengeRule(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Add a rule..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newChallengeRule.trim()) {
                              setChallengeRules([...challengeRules, newChallengeRule.trim()]);
                              setNewChallengeRule("");
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newChallengeRule.trim()) {
                              setChallengeRules([...challengeRules, newChallengeRule.trim()]);
                              setNewChallengeRule("");
                            }
                          }}
                          size="sm"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={createChallenge} className="bg-purple-600 hover:bg-purple-700">
                      Create Challenge
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingChallenge(false);
                        setChallengeTitle("");
                        setChallengeDescription("");
                        setChallengeRules([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditHabitModal
        habit={selectedHabit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHabit(null);
        }}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
          setIsEditModalOpen(false);
          setSelectedHabit(null);
        }}
      />
    </div>
  );
}