import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Trophy, 
  Plus, 
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Trash2,
  Star
} from 'lucide-react';
import { RulesHeatmap } from '@/components/habits/rules-heatmap';
import { AchievementHistory } from '@/components/habits/achievement-history';

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
  const [newRule, setNewRule] = useState("");
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedTab, setSelectedTab] = useState("rules");

  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeDuration, setChallengeDuration] = useState(40);
  const [challengeRules, setChallengeRules] = useState<string[]>([]);
  const [newChallengeRule, setNewChallengeRule] = useState("");
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ['/api/rules'],
    refetchInterval: 5000,
  });

  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['/api/challenges'],
  });

  const toggleRuleCompletion = useMutation({
    mutationFn: (ruleId: number) => apiRequest(`/api/rules/${ruleId}/toggle`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rules'] });
      toast({
        title: "Rule updated!",
        description: "Keep maintaining your standards.",
      });
    },
  });

  const markRuleFailure = useMutation({
    mutationFn: (ruleId: number) => apiRequest(`/api/rules/${ruleId}/break`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rules'] });
      toast({
        title: "Rule marked as broken",
        description: "Tomorrow is a new opportunity to uphold your standards.",
        variant: "destructive"
      });
    },
  });

  const addRuleMutation = useMutation({
    mutationFn: (ruleData: { title: string; description?: string; category?: string; importance?: string }) => 
      apiRequest('/api/rules', { 
        method: 'POST', 
        body: JSON.stringify(ruleData),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rules'] });
      setNewRule("");
      setIsAddingRule(false);
      toast({
        title: "New rule added!",
        description: "Your discipline system is getting stronger.",
      });
    },
  });

  const handleAddRule = () => {
    if (newRule.trim()) {
      addRuleMutation.mutate({
        title: newRule.trim(),
        category: 'personal',
        importance: 'medium'
      });
    }
  };

  const createChallenge = useMutation({
    mutationFn: (data: any) => apiRequest('/api/challenges', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      setChallengeTitle("");
      setChallengeDescription("");
      setChallengeDuration(40);
      setChallengeRules([]);
      setIsCreatingChallenge(false);
      toast({
        title: "Challenge created!",
        description: `Your ${challengeDuration}-day challenge begins now.`,
      });
    },
  });

  const handleCreateChallenge = () => {
    if (!challengeTitle.trim()) return;

    createChallenge.mutate({
      title: challengeTitle,
      description: challengeDescription || undefined,
      duration: challengeDuration,
      startDate: new Date().toISOString(),
      rules: challengeRules.length > 0 ? challengeRules : [],
    });
  };

  const updateChallengeLog = useMutation({
    mutationFn: ({ challengeId, day, completed }: { challengeId: number; day: number; completed: boolean }) => 
      apiRequest(`/api/challenges/${challengeId}/day/${day}`, { 
        method: 'PATCH', 
        body: { completed }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
  });

  const handleChallengeCheckOff = (challengeId: number, day: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const isCompleted = challenge.completedDays?.includes(day);
    updateChallengeLog.mutate({
      challengeId,
      day,
      completed: !isCompleted
    });
  };

  const addChallengeRule = () => {
    if (newChallengeRule.trim() && !challengeRules.includes(newChallengeRule.trim())) {
      setChallengeRules(prev => [...prev, newChallengeRule.trim()]);
      setNewChallengeRule("");
    }
  };

  const removeChallengeRule = (ruleToRemove: string) => {
    setChallengeRules(prev => prev.filter(rule => rule !== ruleToRemove));
  };

  const deleteChallenge = useMutation({
    mutationFn: (challengeId: number) => apiRequest(`/api/challenges/${challengeId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      toast({
        title: "Challenge deleted",
        description: "Challenge removed from your active list.",
      });
    },
  });

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="challenge" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Challenge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Rules Heat Map */}
          <RulesHeatmap rules={rules} />

          {/* Add New Rule */}
          {isAddingRule && (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Enter your new rule..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                  />
                  <Button onClick={handleAddRule} disabled={!newRule.trim()}>
                    Add Rule
                  </Button>
                  <Button onClick={() => setIsAddingRule(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rules List */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-lg">Rules of Discipline</CardTitle>
                </div>
                {!isAddingRule && (
                  <Button 
                    onClick={() => setIsAddingRule(true)}
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {rules.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rules Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first rule to start building personal discipline.
                  </p>
                  <Button onClick={() => setIsAddingRule(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Rule
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRuleCompletion.mutate(rule.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            rule.completedToday 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {rule.completedToday && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div>
                          <h4 className="font-medium text-gray-900">{rule.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {rule.streak} day streak
                            </Badge>
                            {rule.category && (
                              <Badge variant="outline" className="text-xs">
                                {rule.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => markRuleFailure.mutate(rule.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Break Rule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenge" className="space-y-6">
          {/* Active Challenges */}
          <div className="space-y-4">
            {/* Challenge Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardHeader>
                <div>
                  <CardTitle className="text-2xl font-bold">40-100 Day Challenges</CardTitle>
                  <p className="text-purple-100 mt-1">Transform through extended commitment challenges</p>
                </div>
              </CardHeader>
            </Card>
            
            {/* New Challenge Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setIsCreatingChallenge(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg px-8 py-6 text-lg font-semibold flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Start New Challenge
              </Button>
            </div>

            {/* Active Challenges List */}
            {challenges.map((challenge) => {
              const completedPercentage = Math.round((challenge.completedDays.length / challenge.duration) * 100);
              const today = Math.floor((new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
              
              return (
                <Card key={challenge.id} className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
                        {challenge.description && (
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Day {Math.min(today, challenge.duration)}
                          </div>
                          <p className="text-sm text-gray-600">of {challenge.duration}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteChallenge.mutate(challenge.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-purple-600">{completedPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${completedPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{challenge.completedDays.length} days completed</span>
                        <span>{challenge.duration - challenge.completedDays.length} days remaining</span>
                      </div>
                    </div>

                    {/* Progress Calendar - Optimized Grid */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">Progress Calendar</h4>
                      <div className="grid grid-cols-10 gap-1.5">
                        {Array.from({ length: challenge.duration }, (_, i) => i + 1).map((day) => (
                          <button
                            key={day}
                            onClick={() => handleChallengeCheckOff(challenge.id, day)}
                            className={`
                              aspect-square rounded-md text-xs font-medium border transition-all duration-200 flex items-center justify-center
                              ${challenge.completedDays.includes(day)
                                ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                : day === today
                                  ? 'bg-purple-100 border-purple-400 text-purple-700 font-bold'
                                  : day < today
                                    ? 'bg-white border-gray-300 hover:bg-red-50 hover:border-red-300 text-gray-700'
                                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                              }
                            `}
                            disabled={day > today}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Challenge Rules */}
                    {challenge.rules && challenge.rules.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">Challenge Rules</h4>
                        <ul className="space-y-1">
                          {challenge.rules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Create Challenge Modal/Form */}
            {isCreatingChallenge && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-purple-800">Create New Challenge</CardTitle>
                  <p className="text-purple-600">Design your next transformative commitment</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="challenge-title">Challenge Title *</Label>
                    <Input
                      id="challenge-title"
                      value={challengeTitle}
                      onChange={(e) => setChallengeTitle(e.target.value)}
                      placeholder="e.g., 75 Hard, No Social Media, Daily Reading"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenge-desc">Description (Optional)</Label>
                    <Textarea
                      id="challenge-desc"
                      value={challengeDescription}
                      onChange={(e) => setChallengeDescription(e.target.value)}
                      placeholder="Describe what this challenge means to you..."
                      className="border-purple-200 focus:border-purple-500"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenge-duration">Duration (Days)</Label>
                    <Select value={challengeDuration.toString()} onValueChange={(value) => setChallengeDuration(parseInt(value))}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">40 Days</SelectItem>
                        <SelectItem value="70">70 Days</SelectItem>
                        <SelectItem value="100">100 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Challenge Rules (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newChallengeRule}
                        onChange={(e) => setNewChallengeRule(e.target.value)}
                        placeholder="Add a rule..."
                        className="border-purple-200 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && addChallengeRule()}
                      />
                      <Button onClick={addChallengeRule} variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {challengeRules.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {challengeRules.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded p-2 border border-purple-100">
                            <span className="text-sm">{rule}</span>
                            <Button
                              onClick={() => removeChallengeRule(rule)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleCreateChallenge}
                      disabled={!challengeTitle.trim()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                    >
                      Start Challenge
                    </Button>
                    <Button 
                      onClick={() => setIsCreatingChallenge(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State for Challenges */}
            {challenges.length === 0 && !isCreatingChallenge && (
              <Card className="border-0 shadow-lg border-dashed border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Challenges</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Start a 75 or 100-day challenge to push your limits and build unbreakable discipline.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}