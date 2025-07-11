import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Heart, Users, Target, Calendar, ImageIcon, FileText } from "lucide-react";
import { useState } from "react";

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

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{goal.title}</CardTitle>
            {goal.description && (
              <p className="text-muted-foreground text-sm">{goal.description}</p>
            )}
          </div>
          {goal.dueDate && (
            <Badge variant="secondary" className="ml-2">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(goal.dueDate), "MMM d")}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium text-blue-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {completedMicroGoals} of {totalMicroGoals} tasks completed
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {goal.benefits && goal.benefits.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <Heart className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Benefits</p>
                <p className="text-sm font-medium">{goal.benefits.length}</p>
              </div>
            </div>
          )}
          {goal.peopleHelped && goal.peopleHelped.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">People Helped</p>
                <p className="text-sm font-medium">{goal.peopleHelped.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Section */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm">View Details</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Benefits */}
              {goal.benefits && goal.benefits.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-blue-600" />
                    Benefits
                  </h5>
                  <ul className="space-y-1">
                    {goal.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* People Helped */}
              {goal.peopleHelped && goal.peopleHelped.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    Who It Helps
                  </h5>
                  <ul className="space-y-1">
                    {goal.peopleHelped.map((person, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        {person}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Task List */}
              {goal.microGoals.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Action Steps
                  </h5>
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
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Vision Board
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
