import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Target, Trophy, Medal, Award, Star, Zap, Crown, Gem, X, ChevronDown, ChevronUp, Check } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  benefits?: string[];
  consequences?: string[];
  peopleHelped?: string[];
  microGoals: Array<{
    id: number;
    title: string;
    completed: boolean;
  }>;
}

// Mock achievement data - replace with actual user data
const achievements = [
  { id: 1, title: "Completed Marathon", year: "2023", icon: Medal, color: "bg-gradient-to-r from-amber-500 to-orange-600" },
  { id: 2, title: "Launched Business", year: "2022", icon: Trophy, color: "bg-gradient-to-r from-blue-500 to-indigo-600" },
  { id: 3, title: "Published Book", year: "2022", icon: Award, color: "bg-gradient-to-r from-purple-500 to-pink-600" },
  { id: 4, title: "10K Revenue", year: "2021", icon: Star, color: "bg-gradient-to-r from-green-500 to-emerald-600" },
  { id: 5, title: "Built Mobile App", year: "2021", icon: Zap, color: "bg-gradient-to-r from-yellow-500 to-amber-600" },
  { id: 6, title: "Team Leadership", year: "2020", icon: Crown, color: "bg-gradient-to-r from-red-500 to-rose-600" },
];

export default function GoalsPage() {
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: number) => apiRequest(`/api/goals/${goalId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const refreshGoals = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
  };

  const toggleGoalExpanded = (goalId: number) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleDeleteGoal = (goalId: number) => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading your goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-24">
        {/* Active Goals Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Active Goals
            </h2>
            <Button onClick={() => setShowNewGoalModal(true)} className="bg-blue-600 hover:bg-blue-700 h-8 text-sm">
              <Plus className="w-3 h-3 mr-1" />
              Set a Clear Goal
            </Button>
          </div>

          {goals.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Set your first goal to start tracking your progress and achievements.
                </p>
                <Button onClick={() => setShowNewGoalModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const isExpanded = expandedGoals.has(goal.id);
                return (
                <Card key={goal.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    {/* Header with Accent Color */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold bg-gradient-to-r ${goal.accentColor || 'from-blue-500 to-indigo-600'} bg-clip-text text-transparent`}>
                          {goal.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-0.5">{goal.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleGoalExpanded(goal.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 h-8 w-8"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-gray-400 hover:text-red-600 p-1 h-8 w-8"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar with Gradient */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Goal Progress</span>
                        <span className={`text-lg font-bold bg-gradient-to-r ${goal.accentColor || 'from-blue-500 to-indigo-600'} bg-clip-text text-transparent`}>
                          {goal.completed ? '100%' : '0%'}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${goal.accentColor || 'from-blue-500 to-indigo-600'}`}
                          style={{ width: `${goal.completed ? '100%' : '0%'}` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Benefits */}
                          <div>
                            <h4 className="font-semibold text-blue-600 mb-2 text-sm">Benefits:</h4>
                            <ul className="space-y-1">
                              {goal.benefits?.map((benefit, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Consequences */}
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2 text-sm">Consequences of not achieving:</h4>
                            <ul className="space-y-1">
                              {goal.consequences?.map((consequence, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  {consequence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* People Helped */}
                          <div>
                            <h4 className="font-semibold text-green-600 mb-2 text-sm">Who it helps:</h4>
                            <ul className="space-y-1">
                              {goal.peopleHelped?.map((person, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {person}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Action Steps */}
                          <div>
                            <h4 className="font-semibold text-purple-600 mb-2 text-sm">Action steps:</h4>
                            <div className="space-y-2">
                              {goal.microGoals?.map((microGoal, i) => (
                                <div key={microGoal.id} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    microGoal.completed 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {microGoal.completed && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <span className={`text-sm ${
                                    microGoal.completed 
                                      ? 'text-gray-500 line-through' 
                                      : 'text-gray-700'
                                  }`}>
                                    {microGoal.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </div>

        {/* Achievement History Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Your Achievement History
          </h2>
          <div className="space-y-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 ${achievement.color} text-white animate-fadeIn`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Icon Section */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      <p className="text-sm text-white/80">Achieved in {achievement.year}</p>
                    </div>
                    
                    {/* Year Badge */}
                    <div className="flex-shrink-0 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                      <span className="font-bold text-sm">{achievement.year}</span>
                    </div>
                    
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-y-0 right-0 w-1/3 opacity-10">
                      <div className="h-full w-full bg-gradient-to-l from-transparent to-white"></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      <NewGoalModal 
        open={showNewGoalModal} 
        onOpenChange={setShowNewGoalModal}
        onSuccess={refreshGoals}
      />
    </div>
  );
}