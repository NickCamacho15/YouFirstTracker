import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Target, Star, ImageIcon, Upload, X, Heart, Camera, Trophy } from "lucide-react";

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
    <div className="min-h-screen bg-background relative pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" />
            Goals & Vision
          </h1>
          <p className="text-muted-foreground">Set aspirations, visualize your future, and remember your why</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Vision
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Vision Board
            </TabsTrigger>
            <TabsTrigger value="reasons" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Reasons
            </TabsTrigger>
          </TabsList>

          {/* Vision Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Vision</h2>
                <p className="text-sm text-muted-foreground">Transform your aspirations into actionable steps</p>
              </div>
              <Button onClick={() => setShowNewGoalModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Vision
              </Button>
            </div>

            {(goals as Goal[]).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No vision set yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Start by creating your first vision to track your progress toward excellence
                  </p>
                  <Button onClick={() => setShowNewGoalModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Vision
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

          {/* Vision Board Tab */}
          <TabsContent value="vision" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Vision Board</h2>
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

          {/* Reasons Tab */}
          <TabsContent value="reasons" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Your Why</h2>
                <p className="text-sm text-muted-foreground">Remember why you're committed to excellence</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="reasons-upload"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('reasons-upload')?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </div>
            </div>

            {/* Motivation Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Family & Loved Ones */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
                      <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Family & Loved Ones</CardTitle>
                      <p className="text-sm text-muted-foreground">Who you're building this life for</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sample family photos - replace with user uploads */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-rose-800 dark:text-rose-200">Your Daily Reminders:</h4>
                    <ul className="space-y-1 text-sm text-rose-700 dark:text-rose-300">
                      <li>• "I am building a legacy for my family"</li>
                      <li>• "My growth creates security for those I love"</li>
                      <li>• "Every day I choose to be better for them"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Future Self */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Future Self</CardTitle>
                      <p className="text-sm text-muted-foreground">The person you're becoming</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">1000-Day Vision:</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      "In 1000 days, I will be someone who has built unshakeable habits, 
                      achieved meaningful goals, and created a life of purpose and abundance."
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">What Success Looks Like:</h4>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      <li>• Financial freedom and security</li>
                      <li>• Peak physical and mental health</li>
                      <li>• Deep, meaningful relationships</li>
                      <li>• Mastery in my chosen field</li>
                      <li>• Daily peace and fulfillment</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pain & Gain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What You're Moving Away From */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-red-800 dark:text-red-200">Moving Away From</CardTitle>
                  <p className="text-sm text-red-600 dark:text-red-400">What you refuse to accept</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li>• Mediocrity and settling for less</li>
                    <li>• Financial stress and uncertainty</li>
                    <li>• Feeling out of control</li>
                    <li>• Wasting potential and time</li>
                    <li>• Living without purpose</li>
                  </ul>
                </CardContent>
              </Card>

              {/* What You're Moving Toward */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-green-800 dark:text-green-200">Moving Toward</CardTitle>
                  <p className="text-sm text-green-600 dark:text-green-400">What you're building</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li>• Excellence in all areas of life</li>
                    <li>• Abundance and freedom</li>
                    <li>• Deep confidence and self-mastery</li>
                    <li>• Impact and meaningful contribution</li>
                    <li>• Daily joy and fulfillment</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Daily Mantras */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
              <CardHeader>
                <CardTitle className="text-lg">Daily Mantras</CardTitle>
                <p className="text-sm text-muted-foreground">Remind yourself who you are and where you're going</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        "I am committed to excellence over perfection"
                      </p>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        "Every action I take builds my future self"
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        "I choose growth over comfort, always"
                      </p>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        "My consistency creates my destiny"
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Motivation */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">🚨</span>
                  Emergency Motivation
                </CardTitle>
                <p className="text-sm text-muted-foreground">For when you need an instant reminder of your why</p>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg">
                  <p className="text-center text-amber-800 dark:text-amber-200 font-medium">
                    "The pain of discipline weighs ounces. The pain of regret weighs tons. 
                    Choose your pain wisely."
                  </p>
                  <p className="text-center text-sm text-amber-700 dark:text-amber-300 mt-2">
                    Remember: You've already started. Don't stop now.
                  </p>
                </div>
              </CardContent>
            </Card>
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