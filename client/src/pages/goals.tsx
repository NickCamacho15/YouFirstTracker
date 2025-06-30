import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { Plus, Target } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  microGoals: Array<{
    id: number;
    title: string;
    completed: boolean;
  }>;
}

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
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading your goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-8 h-8 text-accent" />
              Your Goals
            </h1>
            <p className="text-muted-foreground mt-2">
              Set ambitious targets and track your progress
            </p>
          </div>
          <Button onClick={() => setShowNewGoalModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>

        {/* Goals Grid */}
        <div className="space-y-6">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Goals Set Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by creating your first goal to begin your journey.
                  </p>
                  <Button onClick={() => setShowNewGoalModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(goals as Goal[]).map((goal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={refreshGoals} />
              ))}
            </div>
          )}
        </div>

        {/* New Goal Modal */}
        <NewGoalModal
          open={showNewGoalModal}
          onOpenChange={setShowNewGoalModal}
          onSuccess={refreshGoals}
        />
      </div>
    </div>
  );
}