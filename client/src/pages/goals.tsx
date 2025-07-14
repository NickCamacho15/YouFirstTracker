import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Target, Trophy, Medal, Award, Star, Zap, Crown, Gem } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  benefits?: string[];
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
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const refreshGoals = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading your goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-8 h-8 text-blue-600" />
            Goals & Achievements
          </h1>
          <p className="text-muted-foreground mt-2">Transform aspirations into achievements through strategic action</p>
        </div>

        {/* Active Goals Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Active Goals
            </h2>
            <Button onClick={() => setShowNewGoalModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Set a Clear Goal
            </Button>
          </div>

          {/* Mock goals for layout - Replace with actual data when goals exist */}
          <div className="space-y-3">
            {/* Sample goals with nameplate design */}
            {[
              { id: 1, title: 'Q4 Business Review', description: 'Complete quarterly business analysis', tasksCompleted: 234, daysWorking: 45, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
              { id: 2, title: 'Team Leadership', description: 'Develop team processes and culture', tasksCompleted: 187, daysWorking: 62, color: 'bg-gradient-to-r from-purple-500 to-pink-600' },
              { id: 3, title: 'Personal Development', description: 'Health and wellness improvements', tasksCompleted: 456, daysWorking: 89, color: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
              { id: 4, title: 'Home Organization', description: 'Organize and optimize living space', tasksCompleted: 98, daysWorking: 23, color: 'bg-gradient-to-r from-orange-500 to-red-600' }
            ].map((goal) => {
              const progress = Math.min(100, Math.round((goal.tasksCompleted / 500) * 100)); // Assuming 500 tasks as a milestone
              return (
                <div key={goal.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden">
                  <div className={`h-full p-4 ${goal.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate">{goal.title}</h3>
                        <p className="text-white/80 text-sm truncate">{goal.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-white">
                        <div className="text-right">
                          <div className="text-xl font-bold">{goal.tasksCompleted}</div>
                          <div className="text-xs opacity-80">tasks</div>
                        </div>
                        <div className="h-10 w-0.5 bg-white/30"></div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{goal.daysWorking}</div>
                          <div className="text-xs opacity-80">days</div>
                        </div>
                        <div className="h-10 w-0.5 bg-white/30"></div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{Math.round(goal.tasksCompleted / goal.daysWorking)}</div>
                          <div className="text-xs opacity-80">avg/day</div>
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">Goal Progress</span>
                        <span className="text-sm text-white/90 font-semibold">{progress}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/80 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {(goals as Goal[]).length === 0 && (
            <Card className="border-0 shadow-lg mt-6">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active goals yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Start by setting a clear goal to track your progress toward excellence
                </p>
                <Button onClick={() => setShowNewGoalModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </CardContent>
            </Card>
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