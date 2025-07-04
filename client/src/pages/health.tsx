import { useState, useMemo } from "react";
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
import { Plus, Calendar, TrendingUp, Dumbbell, Weight, Trophy, Activity, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Common exercises database
const COMMON_EXERCISES = [
  // Strength - Lower Body
  { name: "Back Squat", category: "strength" },
  { name: "Front Squat", category: "strength" },
  { name: "Goblet Squat", category: "strength" },
  { name: "Bulgarian Split Squat", category: "strength" },
  { name: "Front Foot Elevated Split Squat", category: "strength" },
  { name: "Reverse Lunge", category: "strength" },
  { name: "Walking Lunge", category: "strength" },
  { name: "Romanian Deadlift", category: "strength" },
  { name: "Conventional Deadlift", category: "strength" },
  { name: "Sumo Deadlift", category: "strength" },
  { name: "Single Leg Deadlift", category: "strength" },
  { name: "Hip Thrust", category: "strength" },
  { name: "Calf Raise", category: "strength" },
  { name: "Leg Press", category: "strength" },
  { name: "Leg Extension", category: "strength" },
  { name: "Leg Curl", category: "strength" },

  // Strength - Upper Body Push
  { name: "Bench Press", category: "strength" },
  { name: "Incline Bench Press", category: "strength" },
  { name: "Decline Bench Press", category: "strength" },
  { name: "Dumbbell Press", category: "strength" },
  { name: "Overhead Press", category: "strength" },
  { name: "Push Press", category: "strength" },
  { name: "Dips", category: "strength" },
  { name: "Push-ups", category: "strength" },
  { name: "Pike Push-ups", category: "strength" },
  { name: "Diamond Push-ups", category: "strength" },
  { name: "Lateral Raise", category: "strength" },
  { name: "Front Raise", category: "strength" },
  { name: "Rear Delt Fly", category: "strength" },

  // Strength - Upper Body Pull
  { name: "Pull-ups", category: "strength" },
  { name: "Chin-ups", category: "strength" },
  { name: "Lat Pulldown", category: "strength" },
  { name: "Bent Over Row", category: "strength" },
  { name: "T-Bar Row", category: "strength" },
  { name: "Seated Cable Row", category: "strength" },
  { name: "Single Arm Row", category: "strength" },
  { name: "Face Pull", category: "strength" },
  { name: "Shrugs", category: "strength" },

  // Strength - Arms
  { name: "Bicep Curl", category: "strength" },
  { name: "Hammer Curl", category: "strength" },
  { name: "Preacher Curl", category: "strength" },
  { name: "Tricep Dip", category: "strength" },
  { name: "Tricep Extension", category: "strength" },
  { name: "Close Grip Bench Press", category: "strength" },
  { name: "Skull Crushers", category: "strength" },

  // Strength - Core
  { name: "Plank", category: "strength" },
  { name: "Side Plank", category: "strength" },
  { name: "Russian Twist", category: "strength" },
  { name: "Mountain Climbers", category: "strength" },
  { name: "Dead Bug", category: "strength" },
  { name: "Bird Dog", category: "strength" },

  // Cardio
  { name: "Running", category: "cardio" },
  { name: "Cycling", category: "cardio" },
  { name: "Swimming", category: "cardio" },
  { name: "Rowing", category: "cardio" },
  { name: "Elliptical", category: "cardio" },
  { name: "Stair Climber", category: "cardio" },
  { name: "Jump Rope", category: "cardio" },
  { name: "Burpees", category: "cardio" },

  // Functional
  { name: "Thrusters", category: "functional" },
  { name: "Wall Balls", category: "functional" },
  { name: "Box Jumps", category: "functional" },
  { name: "Kettlebell Swings", category: "functional" },
  { name: "Turkish Get-up", category: "functional" },
  { name: "Farmers Walk", category: "functional" },
  { name: "Bear Crawl", category: "functional" },
  { name: "Battle Ropes", category: "functional" },
];

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
  reps: z.number().min(0, "Reps must be positive").optional(),
  sets: z.number().min(0, "Sets must be positive").optional(),
  // Cardio fields
  distance: z.string().optional(),
  time: z.string().optional(),
  pace: z.string().optional(),
  heartRate: z.number().min(0, "Heart rate must be positive").optional(),
  cardioType: z.string().optional(),
  // Functional fields
  workoutName: z.string().optional(),
  timeDomain: z.string().optional(),
  roundsCompleted: z.number().min(0, "Rounds must be positive").optional(),
  repsPerRound: z.number().min(0, "Reps per round must be positive").optional(),
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
  const [workoutSession, setWorkoutSession] = useState<any[]>([]);
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Exercise search state
  const [exerciseSearchOpen, setExerciseSearchOpen] = useState(false);
  const [exerciseSearchValue, setExerciseSearchValue] = useState("");
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);

  // Combine common exercises with database exercises
  const allExercises = useMemo(() => {
    const dbExercises = exercises as any[];
    const dbExerciseNames = new Set(dbExercises.map((ex: any) => ex.name));
    const commonExercisesNotInDb = COMMON_EXERCISES.filter(ex => !dbExerciseNames.has(ex.name));
    const combined = [...dbExercises, ...commonExercisesNotInDb];
    // Sort alphabetically
    return combined.sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  // Filter exercises based on search
  const filteredExercises = useMemo(() => {
    if (!exerciseSearchValue) return allExercises;
    const filtered = allExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(exerciseSearchValue.toLowerCase())
    );
    // Keep alphabetical order in filtered results
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [allExercises, exerciseSearchValue]);




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

  // Create workout log mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (sessionData: { date: string; exercises: any[] }) => {
      // Helper function to convert time format (mm:ss) to seconds
      const parseTime = (timeString: string): number => {
        if (!timeString) return 0;
        const parts = timeString.split(':');
        if (parts.length === 2) {
          const minutes = parseInt(parts[0], 10) || 0;
          const seconds = parseInt(parts[1], 10) || 0;
          return minutes * 60 + seconds;
        }
        return 0;
      };

      // Transform exercises for backend
      const workoutExercises = sessionData.exercises.map(exerciseData => {
        const baseExercise = {
          name: exerciseData.exerciseName,
          category: exerciseData.category,
          notes: exerciseData.notes,
        };

        if (exerciseData.category === 'strength') {
          return {
            ...baseExercise,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            weight: exerciseData.weight,
          };
        } else if (exerciseData.category === 'cardio') {
          return {
            ...baseExercise,
            sets: 1,
            distance: exerciseData.distance ? Math.round(parseFloat(exerciseData.distance) * 1609.34) : null, // Convert miles to meters
            duration: exerciseData.time ? parseTime(exerciseData.time) : null,
          };
        } else if (exerciseData.category === 'functional') {
          return {
            ...baseExercise,
            sets: exerciseData.roundsCompleted || 1,
            reps: exerciseData.repsPerRound,
            duration: exerciseData.timeDomain ? parseTime(exerciseData.timeDomain) : null,
          };
        }

        return { ...baseExercise, sets: 1 };
      });

      // Create the workout
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Workout - ${new Date(sessionData.date).toLocaleDateString()}`,
          description: `Complete workout with ${sessionData.exercises.length} exercises`,
          date: sessionData.date,
          exercises: workoutExercises,
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
        description: `Complete workout with ${workoutSession.length} exercises recorded.`,
      });
      setWorkoutSession([]);
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

  // Form for adding new exercises
  const newExerciseForm = useForm<z.infer<typeof createExerciseSchema>>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  });

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseData: z.infer<typeof createExerciseSchema>) => {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exerciseData),
      });
      if (!response.ok) throw new Error("Failed to create exercise");
      return response.json();
    },
    onSuccess: (newExercise) => {
      // Update the cache directly with the new exercise
      queryClient.setQueryData(["/api/exercises"], (oldData: any) => {
        const updatedData = oldData ? [...oldData, newExercise] : [newExercise];
        return updatedData.sort((a: any, b: any) => a.name.localeCompare(b.name));
      });
      
      toast({
        title: "Exercise added",
        description: `"${newExercise.name}" has been added and selected.`,
      });
      
      // Auto-select the new exercise in the workout form
      workoutForm.setValue("exerciseName", newExercise.name);
      workoutForm.setValue("category", newExercise.category);
      
      setShowAddExerciseDialog(false);
      newExerciseForm.reset();
    },
  });

  const onAddExerciseToSession = (data: z.infer<typeof workoutLogSchema>) => {
    // Clean up the data to remove undefined values and ensure proper types
    const cleanedData = {
      exerciseName: data.exerciseName,
      category: data.category,
      // Convert undefined to null for numeric fields
      weight: data.weight || null,
      reps: data.reps || null,
      sets: data.sets || null,
      heartRate: data.heartRate || null,
      roundsCompleted: data.roundsCompleted || null,
      repsPerRound: data.repsPerRound || null,
      rpe: data.rpe || null,
      // Keep string fields as empty strings if undefined
      distance: data.distance || "",
      time: data.time || "",
      pace: data.pace || "",
      cardioType: data.cardioType || "",
      workoutName: data.workoutName || "",
      timeDomain: data.timeDomain || "",
      functionalType: data.functionalType || "",
      notes: data.notes || "",
    };

    const newExercise = {
      id: Date.now(), // temporary ID for session
      ...cleanedData
    };
    setWorkoutSession(prev => [...prev, newExercise]);
    workoutForm.reset({
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
    });
    toast({
      title: "Exercise added",
      description: `${data.exerciseName} added to today's workout`,
    });
  };

  const onLogCompleteWorkout = () => {
    if (workoutSession.length === 0) {
      toast({
        title: "No exercises",
        description: "Please add at least one exercise to log a workout",
        variant: "destructive",
      });
      return;
    }
    createWorkoutMutation.mutate({
      date: workoutDate,
      exercises: workoutSession
    });
  };

  const removeFromSession = (id: number) => {
    setWorkoutSession(prev => prev.filter(ex => ex.id !== id));
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
                
                {/* Workout Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workout Date</label>
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Current Workout Session */}
                {workoutSession.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Today's Workout ({workoutSession.length} exercises)</h4>
                      <Button 
                        onClick={onLogCompleteWorkout}
                        disabled={createWorkoutMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {createWorkoutMutation.isPending ? "Logging..." : "Log Complete Workout"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {workoutSession.map((exercise) => (
                        <div key={exercise.id} className="flex justify-between items-center p-3 bg-white rounded border">
                          <div>
                            <span className="font-medium">{exercise.exerciseName}</span>
                            <span className="text-sm text-gray-500 ml-2">({exercise.category})</span>
                            {(exercise.weight || exercise.reps || exercise.sets) && (
                              <span className="text-sm text-gray-600 ml-2">
                                {exercise.weight ? `${exercise.weight}lbs` : ''} 
                                {exercise.reps ? ` × ${exercise.reps}` : ''}
                                {exercise.sets ? ` × ${exercise.sets}` : ''}
                              </span>
                            )}
                            {(exercise.distance || exercise.time) && (
                              <span className="text-sm text-gray-600 ml-2">
                                {exercise.distance || ''}{exercise.distance && exercise.time ? ', ' : ''}{exercise.time || ''}
                              </span>
                            )}
                            {exercise.workoutName && <span className="text-sm text-gray-600 ml-2">{exercise.workoutName}</span>}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromSession(exercise.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Exercise Form */}
                <Form {...workoutForm}>
                  <form onSubmit={workoutForm.handleSubmit(onAddExerciseToSession)} className="space-y-6">
                    <FormField
                      control={workoutForm.control}
                      name="exerciseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise Name</FormLabel>
                          <Popover open={exerciseSearchOpen} onOpenChange={setExerciseSearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={exerciseSearchOpen}
                                  className="w-full justify-between text-left font-normal"
                                >
                                  {field.value || "Search exercises..."}
                                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Search exercises..."
                                  value={exerciseSearchValue}
                                  onValueChange={setExerciseSearchValue}
                                />
                                <CommandList>
                                  <CommandEmpty className="py-6 text-center text-sm">
                                    <div className="space-y-3">
                                      <p>No exercises found.</p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          // Create the exercise immediately and add to workout
                                          const exerciseName = exerciseSearchValue.trim();
                                          if (exerciseName) {
                                            createExerciseMutation.mutate({
                                              name: exerciseName,
                                              category: "functional", // Default category
                                              description: "",
                                            });
                                            setExerciseSearchOpen(false);
                                            setExerciseSearchValue("");
                                          }
                                        }}
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add "{exerciseSearchValue}" Exercise
                                      </Button>
                                    </div>
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {filteredExercises.map((exercise: any) => (
                                      <CommandItem
                                        key={exercise.name}
                                        value={exercise.name}
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue);
                                          workoutForm.setValue("category", exercise.category);
                                          setExerciseSearchOpen(false);
                                          setExerciseSearchValue("");
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span>{exercise.name}</span>
                                          <span className="text-xs text-muted-foreground capitalize">
                                            {exercise.category}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                                  <span className="text-xs text-white/80 data-[highlighted]:text-white">Focused on building muscle and increasing load capacity</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cardio">
                                <div className="flex flex-col">
                                  <span>Cardio</span>
                                  <span className="text-xs text-white/80 data-[highlighted]:text-white">Focused on endurance, heart rate, and aerobic capacity</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="functional">
                                <div className="flex flex-col">
                                  <span>Functional</span>
                                  <span className="text-xs text-white/80 data-[highlighted]:text-white">Blends strength, mobility, and conditioning for real-world movement</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                  min="0"
                                  placeholder="e.g., 135"
                                  value={field.value ?? ""}
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
                                  min="0"
                                  placeholder="e.g., 12"
                                  value={field.value ?? ""}
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
                                  min="0"
                                  placeholder="e.g., 3"
                                  value={field.value ?? ""}
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
                                    min="0"
                                    placeholder="Avg or max BPM"
                                    value={field.value ?? ""}
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
                                    min="0"
                                    placeholder="e.g., 5"
                                    value={field.value ?? ""}
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
                                    min="0"
                                    placeholder="e.g., 10"
                                    value={field.value ?? ""}
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
                                    value={field.value ?? ""}
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
                    >
                      Add Exercise to Workout
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

      {/* Add New Exercise Dialog */}
      <Dialog open={showAddExerciseDialog} onOpenChange={setShowAddExerciseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
          </DialogHeader>
          <Form {...newExerciseForm}>
            <form onSubmit={newExerciseForm.handleSubmit((data) => createExerciseMutation.mutate(data))} className="space-y-4">
              <FormField
                control={newExerciseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bulgarian Split Squat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newExerciseForm.control}
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
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="functional">Functional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newExerciseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the exercise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddExerciseDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createExerciseMutation.isPending}>
                  {createExerciseMutation.isPending ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}