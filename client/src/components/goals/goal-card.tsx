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

// Goal color variants based on category/id
const goalColors = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-purple-500 to-pink-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-cyan-500 to-blue-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
];

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

  // Get color based on goal ID
  const colorClass = goalColors[goal.id % goalColors.length];

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${colorClass} text-white overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1 text-white">{goal.title}</CardTitle>
            {goal.description && (
              <p className="text-white/80 text-sm">{goal.description}</p>
            )}
          </div>
          {goal.dueDate && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
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
            <span className="text-white/80">Overall Progress</span>
            <span className="font-medium text-white">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-white/70 mt-1">
            {completedMicroGoals} of {totalMicroGoals} tasks completed
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {goal.benefits && goal.benefits.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
              <div>
                <p className="text-xs text-white/70">Benefits</p>
                <p className="text-sm font-medium text-white">{goal.benefits.length}</p>
              </div>
            </div>
          )}
          {goal.peopleHelped && goal.peopleHelped.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
              <Users className="w-4 h-4 text-white" />
              <div>
                <p className="text-xs text-white/70">People Helped</p>
                <p className="text-sm font-medium text-white">{goal.peopleHelped.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Commitment Score */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-white">{totalMicroGoals}</div>
            <div className="text-xs text-white/70">total tasks</div>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-white">{completedMicroGoals}</div>
            <div className="text-xs text-white/70">completed</div>
          </div>
        </div>

        {/* Expandable Section */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-white hover:bg-white/20"
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
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-white">
                    <Heart className="w-4 h-4" />
                    Benefits
                  </h5>
                  <ul className="space-y-1">
                    {goal.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-white mt-0.5">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* People Helped */}
              {goal.peopleHelped && goal.peopleHelped.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-white">
                    <Users className="w-4 h-4" />
                    Who It Helps
                  </h5>
                  <ul className="space-y-1">
                    {goal.peopleHelped.map((person, i) => (
                      <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-white mt-0.5">•</span>
                        {person}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Task List */}
              {goal.microGoals.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-white">
                    <Target className="w-4 h-4" />
                    Action Steps
                  </h5>
                  <div className="space-y-2">
                    {goal.microGoals.map((microGoal) => (
                      <div key={microGoal.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={microGoal.completed}
                          onCheckedChange={() => handleMicroGoalToggle(microGoal.id, microGoal.completed)}
                          disabled={updateMicroGoalMutation.isPending}
                          className="bg-white/20 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <span
                          className={`text-sm ${
                            microGoal.completed
                              ? "line-through text-white/60"
                              : "text-white"
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
                <Button variant="outline" size="sm" className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Vision Board
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30">
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
