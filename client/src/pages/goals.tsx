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
  { id: 1, title: "Completed Marathon", year: "2023", icon: Medal, color: "bg-gradient-to-r from-amber-400 to-orange-500" },
  { id: 2, title: "Launched Business", year: "2022", icon: Trophy, color: "bg-gradient-to-r from-blue-400 to-indigo-500" },
  { id: 3, title: "Published Book", year: "2022", icon: Award, color: "bg-gradient-to-r from-purple-400 to-pink-500" },
  { id: 4, title: "10K Revenue", year: "2021", icon: Star, color: "bg-gradient-to-r from-green-400 to-emerald-500" },
  { id: 5, title: "Built Mobile App", year: "2021", icon: Zap, color: "bg-gradient-to-r from-yellow-400 to-amber-500" },
  { id: 6, title: "Team Leadership", year: "2020", icon: Crown, color: "bg-gradient-to-r from-red-400 to-rose-500" },
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

          {(goals as Goal[]).length === 0 ? (
            <Card className="border-0 shadow-lg">
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
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(goals as Goal[]).map((goal: Goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={refreshGoals}
                />
              ))}
            </div>
          )}
        </div>

        {/* Achievement History Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Your Achievement History
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full ${achievement.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.year}</p>
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