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
  accentColor?: string;
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

  // Get color from goal or use default
  const colorClass = goal.accentColor || goalColors[goal.id % goalColors.length];

  return (
    <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        {/* Header with Accent Color */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className={`text-2xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-gray-600 mt-1">{goal.description}</p>
            )}
          </div>
          {goal.dueDate && (
            <Badge variant="outline" className="ml-2">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(goal.dueDate), "MMM d")}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className={`font-semibold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 bg-gradient-to-r ${colorClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedMicroGoals} of {totalMicroGoals} tasks completed
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {goal.benefits && goal.benefits.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Heart className={`w-4 h-4 text-gradient bg-gradient-to-r ${colorClass}`} />
              <div>
                <p className="text-xs text-gray-500">Benefits</p>
                <p className="text-sm font-medium text-gray-800">{goal.benefits.length}</p>
              </div>
            </div>
          )}
          {goal.peopleHelped && goal.peopleHelped.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Users className={`w-4 h-4 text-gradient bg-gradient-to-r ${colorClass}`} />
              <div>
                <p className="text-xs text-gray-500">People Helped</p>
                <p className="text-sm font-medium text-gray-800">{goal.peopleHelped.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Commitment Score */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className={`text-lg font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>{totalMicroGoals}</div>
            <div className="text-xs text-gray-500">total tasks</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className={`text-lg font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>{completedMicroGoals}</div>
            <div className="text-xs text-gray-500">completed</div>
          </div>
        </div>

        {/* Expandable Section */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-gray-600 hover:bg-gray-50"
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
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-gray-700">
                    <Heart className={`w-4 h-4 text-gradient bg-gradient-to-r ${colorClass}`} />
                    Benefits
                  </h5>
                  <ul className="space-y-1">
                    {goal.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className={`mt-0.5 bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* People Helped */}
              {goal.peopleHelped && goal.peopleHelped.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-gray-700">
                    <Users className={`w-4 h-4 text-gradient bg-gradient-to-r ${colorClass}`} />
                    Who It Helps
                  </h5>
                  <ul className="space-y-1">
                    {goal.peopleHelped.map((person, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className={`mt-0.5 bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>•</span>
                        {person}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Task List */}
              {goal.microGoals.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-gray-700">
                    <Target className={`w-4 h-4 text-gradient bg-gradient-to-r ${colorClass}`} />
                    Action Steps
                  </h5>
                  <div className="space-y-2">
                    {goal.microGoals.map((microGoal) => (
                      <div key={microGoal.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={microGoal.completed}
                          onCheckedChange={() => handleMicroGoalToggle(microGoal.id, microGoal.completed)}
                          disabled={updateMicroGoalMutation.isPending}
                          className="border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800"
                        />
                        <span
                          className={`text-sm ${
                            microGoal.completed
                              ? "line-through text-gray-400"
                              : "text-gray-700"
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
                <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Vision Board
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50">
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
