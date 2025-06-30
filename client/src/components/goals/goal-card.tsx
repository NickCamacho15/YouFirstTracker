import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMicroGoalMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/micro-goals/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onUpdate();
      toast({ title: "Progress updated!", description: "Keep up the great work!" });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const completedMicroGoals = goal.microGoals.filter(mg => mg.completed).length;
  const totalMicroGoals = goal.microGoals.length;
  const progressPercent = totalMicroGoals > 0 ? (completedMicroGoals / totalMicroGoals) * 100 : 0;

  const handleMicroGoalToggle = (microGoalId: number, completed: boolean) => {
    updateMicroGoalMutation.mutate({ id: microGoalId, completed: !completed });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-primary mb-1">{goal.title}</h4>
            {goal.description && (
              <p className="text-muted-foreground text-sm">{goal.description}</p>
            )}
          </div>
          {goal.dueDate && (
            <Badge variant="secondary" className="text-xs">
              Due {format(new Date(goal.dueDate), "MMM d")}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-accent font-medium">
              {completedMicroGoals} of {totalMicroGoals} completed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Micro Goals */}
        {goal.microGoals.length > 0 && (
          <div className="space-y-2">
            {goal.microGoals.map((microGoal) => (
              <div key={microGoal.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={microGoal.completed}
                  onCheckedChange={() => handleMicroGoalToggle(microGoal.id, microGoal.completed)}
                  disabled={updateMicroGoalMutation.isPending}
                />
                <span
                  className={`text-sm ${
                    microGoal.completed
                      ? "line-through text-muted-foreground"
                      : "text-primary"
                  }`}
                >
                  {microGoal.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
