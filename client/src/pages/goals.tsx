import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Target, Star, ImageIcon, Upload, X } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const { data: visionItems = [] } = useQuery({
    queryKey: ["/api/vision-board"],
  });

  const refreshGoals = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
  };

  const refreshVisionBoard = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/vision-board"] });
  };

  // Vision board upload mutation
  const addVisionItemMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; caption?: string }) => {
      const response = await fetch("/api/vision-board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add vision item");
      return response.json();
    },
    onSuccess: () => {
      refreshVisionBoard();
    },
  });

  // Vision board delete mutation
  const deleteVisionItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/vision-board/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete vision item");
      return response.json();
    },
    onSuccess: () => {
      refreshVisionBoard();
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // In a real app, you'd upload to a service like Cloudinary or S3
      // For now, we'll use a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        addVisionItemMutation.mutate({ imageUrl });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Target className="w-8 h-8 text-accent" />
            Goals & Vision
          </h1>
          <p className="text-muted-foreground">Set aspirations and visualize your future</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Future Folder
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Goals</h2>
                <p className="text-sm text-muted-foreground">Break down your aspirations into actionable steps</p>
              </div>
              <Button onClick={() => setShowNewGoalModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </div>

            {(goals as Goal[]).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No goals yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Start by creating your first goal to track your progress
                  </p>
                  <Button onClick={() => setShowNewGoalModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(goals as Goal[]).map((goal: Goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={refreshGoals}
                    />
                  ))}
                </div>

                {/* Goal Progress Charts */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Goal Progress Analytics</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track task completion trends toward your goals over time
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Sample Goal 1 Progress Chart */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Work Project Progress</h4>
                        <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-end justify-between gap-2">
                          {/* Simple dot chart representation */}
                          {Array.from({ length: 7 }, (_, i) => {
                            const progress = [20, 40, 60, 55, 75, 85, 90][i]; // Mock data
                            return (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div 
                                  className="w-8 bg-blue-500 rounded-t-sm transition-all duration-500"
                                  style={{ height: `${progress}%` }}
                                />
                                <span className="text-xs text-gray-500">
                                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">7 tasks completed this week</span>
                          <span className="text-green-600 font-medium">+15% vs last week</span>
                        </div>
                      </div>

                      {/* Sample Goal 2 Progress Chart */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Team Leadership Progress</h4>
                        <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-end justify-between gap-2">
                          {Array.from({ length: 7 }, (_, i) => {
                            const progress = [10, 25, 30, 45, 50, 65, 70][i]; // Mock data
                            return (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div 
                                  className="w-8 bg-emerald-500 rounded-t-sm transition-all duration-500"
                                  style={{ height: `${progress}%` }}
                                />
                                <span className="text-xs text-gray-500">
                                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">4 tasks completed this week</span>
                          <span className="text-green-600 font-medium">+8% vs last week</span>
                        </div>
                      </div>
                    </div>

                    {/* Overall Progress Summary */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            Total Task Completion Rate
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Across all active goals this month
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">78%</div>
                          <div className="text-sm text-green-600 font-medium">↑ 12% from last month</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Future Folder (Vision Board) Tab */}
          <TabsContent value="vision" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Future Folder</h2>
                <p className="text-sm text-muted-foreground">Visualize your dreams and aspirations</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="vision-upload"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('vision-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
            </div>

            {(visionItems as any[]).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No vision items yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Upload images that represent your future goals and dreams
                  </p>
                  <Button onClick={() => document.getElementById('vision-upload')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Image
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(visionItems as any[]).map((item: any) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={item.imageUrl}
                        alt={item.caption || "Vision item"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <button
                      onClick={() => deleteVisionItemMutation.mutate(item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {item.caption && (
                      <p className="mt-2 text-sm text-center text-muted-foreground">{item.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <NewGoalModal
          open={showNewGoalModal}
          onOpenChange={setShowNewGoalModal}
          onSuccess={refreshGoals}
        />
      </div>
    </div>
  );
}