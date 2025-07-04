import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, TrendingUp, Dumbbell, Weight, Trophy, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const createExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

const workoutLogSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
  category: z.string().min(1, "Please select a category"),
  // Strength fields
  weight: z.number().min(0, "Weight must be positive").optional(),
  reps: z.number().min(1, "Reps must be at least 1").optional(),
  sets: z.number().min(1, "Sets must be at least 1").optional(),
  // Cardio fields
  distance: z.string().optional(),
  time: z.string().optional(),
  pace: z.string().optional(),
  heartRate: z.number().optional(),
  cardioType: z.string().optional(),
  // Functional fields
  workoutName: z.string().optional(),
  timeDomain: z.string().optional(),
  roundsCompleted: z.number().optional(),
  repsPerRound: z.number().optional(),
  rpe: z.number().min(1).max(10).optional(),
  functionalType: z.string().optional(),
  notes: z.string().optional(),
});

export default function HealthPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  // Fetch exercises for dropdown
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/exercises"],
    enabled: !!user,
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [workoutTab, setWorkoutTab] = useState("dashboard");
  const [isAddingNewExercise, setIsAddingNewExercise] = useState(false);

  // Form for creating new exercises
  const exerciseForm = useForm<z.infer<typeof createExerciseSchema>>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      name: "",
      category: "strength",
      description: "",
    },
  });

  // Form for logging workouts
  const workoutForm = useForm<z.infer<typeof workoutLogSchema>>({
    resolver: zodResolver(workoutLogSchema),
    defaultValues: {
      exerciseName: "",
      category: "",
      weight: undefined,
      reps: undefined,
      sets: undefined,
      distance: "",
      time: "",
      pace: "",
      heartRate: undefined,
      cardioType: "",
      workoutName: "",
      timeDomain: "",
      roundsCompleted: undefined,
      repsPerRound: undefined,
      rpe: undefined,
      functionalType: "",
      notes: "",
    },
  });

  // Get selected category to determine which fields to show
  const selectedCategory = workoutForm.watch("category");

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createExerciseSchema>) => {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create exercise");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise created",
        description: "Your new exercise has been added to the dropdown.",
      });
      exerciseForm.reset();
      setIsAddingNewExercise(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create workout log mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof workoutLogSchema>) => {
      // First create or find the exercise
      const exerciseResponse = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.exerciseName,
          category: data.category,
          description: "",
        }),
      });
      
      const exercise = await exerciseResponse.json();
      const exerciseId = exercise.id;

      // Then create the workout
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${data.exerciseName} Session`,
          description: data.notes || "",
          exercises: [{
            exerciseId: exerciseId,
            weight: data.weight,
            reps: data.reps,
            sets: data.sets,
          }],
        }),
      });
      if (!response.ok) throw new Error("Failed to create workout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Workout logged",
        description: "Your workout has been successfully recorded.",
      });
      workoutForm.reset();
      setWorkoutTab("dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onCreateExercise = (data: z.infer<typeof createExerciseSchema>) => {
    createExerciseMutation.mutate(data);
  };

  const onLogWorkout = (data: z.infer<typeof workoutLogSchema>) => {
    createWorkoutMutation.mutate(data);
  };

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

  // Show workout section if activeTab is "workout-section"
  if (activeTab === "workout-section") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("dashboard")}
                  className="mr-2"
                >
                  ← Back
                </Button>
                <Dumbbell className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Workout Section</h1>
                  <p className="text-sm text-gray-600">Track and log your workouts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Section Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={workoutTab} onValueChange={setWorkoutTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="log-workout">Log Workout</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <div className="space-y-6">
                {/* Workout Progress Charts */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Workout Analytics</h3>
                  <p className="text-gray-600">Coming soon - comprehensive workout analytics dashboard</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="log-workout" className="mt-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Log New Workout</h3>
                
                {/* Add New Exercise Section */}
                {isAddingNewExercise ? (
                  <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                    <Form {...exerciseForm}>
                      <form onSubmit={exerciseForm.handleSubmit(onCreateExercise)} className="space-y-4">
                        <FormField
                          control={exerciseForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Front foot heel elevated squat" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={exerciseForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="strength">
                                    <div className="flex flex-col">
                                      <span>Strength</span>
                                      <span className="text-xs text-gray-500">Focused on building muscle and increasing load capacity</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cardio">
                                    <div className="flex flex-col">
                                      <span>Cardio</span>
                                      <span className="text-xs text-gray-500">Focused on endurance, heart rate, and aerobic capacity</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="functional">
                                    <div className="flex flex-col">
                                      <span>Functional</span>
                                      <span className="text-xs text-gray-500">Blends strength, mobility, and conditioning for real-world movement</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            disabled={createExerciseMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {createExerciseMutation.isPending ? "Adding..." : "Add Exercise"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddingNewExercise(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="mb-6">
                    <Button 
                      onClick={() => setIsAddingNewExercise(true)}
                      variant="outline"
                      className="w-full border-dashed border-2 border-gray-300 hover:border-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Exercise
                    </Button>
                  </div>
                )}

                {/* Workout Logging Form */}
                <Form {...workoutForm}>
                  <form onSubmit={workoutForm.handleSubmit(onLogWorkout)} className="space-y-6">
                    <FormField
                      control={workoutForm.control}
                      name="exerciseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Front foot heel elevated squat" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workoutForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strength">
                                <div className="flex flex-col">
                                  <span>Strength</span>
                                  <span className="text-xs text-gray-500">Focused on building muscle and increasing load capacity</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cardio">
                                <div className="flex flex-col">
                                  <span>Cardio</span>
                                  <span className="text-xs text-gray-500">Focused on endurance, heart rate, and aerobic capacity</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="functional">
                                <div className="flex flex-col">
                                  <span>Functional</span>
                                  <span className="text-xs text-gray-500">Blends strength, mobility, and conditioning for real-world movement</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Debug: Show current category */}
                    {selectedCategory && (
                      <div className="text-sm text-gray-600 mb-4">
                        Selected category: {selectedCategory}
                      </div>
                    )}

                    {/* Conditional fields based on selected category */}
                    {selectedCategory === "strength" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={workoutForm.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 135"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={workoutForm.control}
                          name="reps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reps</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 12"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={workoutForm.control}
                          name="sets"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sets</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 3"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedCategory === "cardio" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={workoutForm.control}
                            name="distance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Distance</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2.5 miles or 400m" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={workoutForm.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 20:15 (mm:ss)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={workoutForm.control}
                            name="pace"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pace (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Auto-calculated or manual entry" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={workoutForm.control}
                            name="heartRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Heart Rate (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Avg or max BPM"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={workoutForm.control}
                          name="cardioType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select cardio type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="run">Run</SelectItem>
                                  <SelectItem value="bike">Bike</SelectItem>
                                  <SelectItem value="row">Row</SelectItem>
                                  <SelectItem value="swim">Swim</SelectItem>
                                  <SelectItem value="walk">Walk</SelectItem>
                                  <SelectItem value="elliptical">Elliptical</SelectItem>
                                  <SelectItem value="stairs">Stairs</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedCategory === "functional" && (
                      <div className="space-y-4">
                        <FormField
                          control={workoutForm.control}
                          name="workoutName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workout Name or Block Name</FormLabel>
                              <FormControl>
                                <Input placeholder='e.g., "Murph," "AMRAP 12: KB + Burpees"' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={workoutForm.control}
                            name="functionalType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select workout type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="amrap">AMRAP (As Many Rounds As Possible)</SelectItem>
                                    <SelectItem value="emom">EMOM (Every Minute On the Minute)</SelectItem>
                                    <SelectItem value="fortime">For Time</SelectItem>
                                    <SelectItem value="circuit">Circuit</SelectItem>
                                    <SelectItem value="tabata">Tabata</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={workoutForm.control}
                            name="timeDomain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time Domain</FormLabel>
                                <FormControl>
                                  <Input placeholder="Total time or work/rest ratio" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={workoutForm.control}
                            name="roundsCompleted"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rounds Completed</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 5"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={workoutForm.control}
                            name="repsPerRound"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reps per Round</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 10"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={workoutForm.control}
                            name="rpe"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RPE (1-10)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="10"
                                    placeholder="Rate of Perceived Exertion"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <FormField
                      control={workoutForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Any additional notes about this workout" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={createWorkoutMutation.isPending}
                    >
                      {createWorkoutMutation.isPending ? "Logging Workout..." : "Log Workout"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Tracking</h3>
                <p className="text-gray-600">Coming soon - detailed progress analytics</p>
              </div>
            </TabsContent>
          </Tabs>
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

              {/* Wellness Trends Chart */}
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

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setActiveTab("workout-section")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Enter Workout
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
      </div>
    </div>
  );
}