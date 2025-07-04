import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Dumbbell, Weight, Trophy, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Temporary simple components until database is ready
const WorkoutDashboard = ({ workouts }: { workouts: any[] }) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-medium mb-2">Workout Dashboard</h3>
    <p className="text-gray-600">Coming soon - comprehensive workout analytics</p>
  </div>
);

const WorkoutLogger = () => (
  <div className="text-center py-8">
    <h3 className="text-lg font-medium mb-2">Workout Logger</h3>
    <p className="text-gray-600">Coming soon - easy workout logging interface</p>
  </div>
);

const WorkoutProgress = ({ workouts }: { workouts: any[] }) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-medium mb-2">Progress Tracking</h3>
    <p className="text-gray-600">Coming soon - detailed progress charts and analytics</p>
  </div>
);

export default function HealthPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch workouts
  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['/api/workouts'],
    enabled: !!user,
  });

  // Fetch body weight logs
  const { data: weightLogs, isLoading: weightLoading } = useQuery({
    queryKey: ['/api/body-weight-logs'],
    enabled: !!user,
  });

  // Get this week's workout count
  const thisWeek = workouts ? (workouts as any[]).filter((workout: any) => {
    const workoutDate = new Date(workout.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return workoutDate >= weekStart;
  }).length : 0;

  // Get total workouts
  const totalWorkouts = workouts ? (workouts as any[]).length : 0;

  // Get current weight
  const currentWeight = weightLogs && (weightLogs as any[]).length > 0 
    ? (weightLogs as any[])[0].weight / 10 // Convert from stored format (1735 = 173.5 lbs)
    : null;

  // Get last workout date
  const lastWorkout = workouts && (workouts as any[]).length > 0
    ? new Date((workouts as any[])[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const lastWorkoutDaysAgo = workouts && (workouts as any[]).length > 0
    ? Math.floor((Date.now() - new Date((workouts as any[])[0].date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (workoutsLoading || weightLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pb-20">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health & Fitness</h1>
          <p className="text-gray-600">Track your workouts, monitor progress, and optimize your fitness journey</p>
        </div>

        {/* Dashboard Cards - Based on your screenshots */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          {/* This Week */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-100 text-sm font-medium">This Week</div>
                <Dumbbell className="w-5 h-5 text-blue-200" />
              </div>
              <div className="text-2xl font-bold">{thisWeek}</div>
              <div className="text-blue-100 text-xs">workouts</div>
            </CardContent>
          </Card>

          {/* Total Workouts */}
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-yellow-100 text-sm font-medium">Total Workouts</div>
                <Trophy className="w-5 h-5 text-yellow-200" />
              </div>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <div className="text-yellow-100 text-xs">all time</div>
            </CardContent>
          </Card>

          {/* Current Weight */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-100 text-sm font-medium">Current Weight</div>
                <Weight className="w-5 h-5 text-green-200" />
              </div>
              <div className="text-2xl font-bold">
                {currentWeight ? `${currentWeight} lbs` : '---'}
              </div>
              <div className="text-green-100 text-xs">
                {currentWeight ? '+1.0 lbs vs last' : 'No data'}
              </div>
            </CardContent>
          </Card>

          {/* Last Workout */}
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-100 text-sm font-medium">Last Workout</div>
                <Calendar className="w-5 h-5 text-purple-200" />
              </div>
              <div className="text-2xl font-bold">
                {lastWorkout || '---'}
              </div>
              <div className="text-purple-100 text-xs">
                {lastWorkoutDaysAgo !== null ? `${lastWorkoutDaysAgo} days ago` : 'No workouts yet'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Workout
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <WorkoutDashboard workouts={workouts || []} />
          </TabsContent>

          <TabsContent value="log" className="mt-6">
            <WorkoutLogger />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <WorkoutProgress workouts={workouts || []} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}