import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Dumbbell, Weight, Trophy, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HealthPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch workouts
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ["/api/workouts"],
    enabled: !!user,
  });

  // Fetch body weight logs
  const { data: bodyWeightLogs = [], isLoading: bodyWeightLoading } = useQuery({
    queryKey: ["/api/body-weight-logs"],
    enabled: !!user,
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access Health</h2>
          <p className="text-gray-600">Track your workouts and nutrition progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Health & Fitness</h1>
                <p className="text-sm text-gray-600">Track your wellness journey</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="log-workout">Log Workout</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Workout Progress Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Dumbbell className="h-5 w-5 mr-2 text-blue-600" />
                    Workout Progress
                  </h3>
                  
                  {/* Workout Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-blue-700">This Week</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">156</div>
                      <div className="text-sm text-green-700">Total Workouts</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">185</div>
                      <div className="text-sm text-purple-700">Current Weight</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">Yesterday</div>
                      <div className="text-sm text-orange-700">Last Workout</div>
                    </div>
                  </div>


                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setActiveTab("log-workout")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Enter Workout Section
                </Button>
              </div>

              {/* Nutrition Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                  <h3 className="text-lg font-medium mb-4">Your Personalized Plan</h3>
                  
                  {/* Nutrition Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">3330</div>
                      <div className="text-sm opacity-90">Daily Calories</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">216g</div>
                      <div className="text-sm opacity-90">Protein</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">484g</div>
                      <div className="text-sm opacity-90">Carbs</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <div className="text-2xl font-bold">59g</div>
                      <div className="text-sm opacity-90">Fat</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-white text-purple-600 hover:bg-gray-50"
                      variant="secondary"
                    >
                      View Details
                    </Button>
                    <Button 
                      className="w-full bg-white text-purple-600 hover:bg-gray-50"
                      variant="secondary"
                    >
                      Meal Plan
                    </Button>
                    <Button 
                      className="w-full bg-white text-purple-600 hover:bg-gray-50"
                      variant="secondary"
                    >
                      Edit My Info
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="log-workout" className="mt-6">
            <div className="space-y-6">
              {/* Wellness Trends Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Workout Progress Charts
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Wellness Trends</h4>
                    <div className="flex space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">Weight</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">Cardio</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                        <span className="text-gray-600">Strength</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Multi-line Chart */}
                  <div className="relative h-32 bg-white rounded border">
                    <svg viewBox="0 0 300 100" className="w-full h-full">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Weight trend line (blue) */}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        points="20,80 60,75 100,70 140,65 180,60 220,58 260,55"
                      />
                      
                      {/* Cardio trend line (green) */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        points="20,90 60,85 100,75 140,70 180,65 220,60 260,50"
                      />
                      
                      {/* Strength trend line (purple) */}
                      <polyline
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        points="20,85 60,80 100,75 140,65 180,55 220,45 260,40"
                      />
                      
                      {/* Data points */}
                      <circle cx="260" cy="55" r="3" fill="#3b82f6" />
                      <circle cx="260" cy="50" r="3" fill="#10b981" />
                      <circle cx="260" cy="40" r="3" fill="#8b5cf6" />
                    </svg>
                  </div>
                  
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-500">30-day wellness progress overview</p>
                  </div>
                </div>
              </div>

              {/* Workout Logger */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-blue-600" />
                  Log New Workout
                </h3>
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Workout logging interface coming soon</p>
                  <p className="text-sm text-gray-500">Track exercises, sets, reps, and weights</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Tracking</h3>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Detailed progress analytics coming soon</p>
                <p className="text-sm text-gray-500">Charts showing strength gains and fitness improvements</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}