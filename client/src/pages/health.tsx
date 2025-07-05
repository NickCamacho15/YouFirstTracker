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

// Compact Exercise Chart Component for Grid Display
function CompactExerciseChart({ 
  exerciseName, 
  sessions, 
  workouts, 
  chartMetric 
}: { 
  exerciseName: string;
  sessions: any[];
  workouts: any[];
  chartMetric: "e1rm" | "volume";
}) {
  if (sessions.length < 1) return null;
  
  // Calculate e1RM and volume for each session
  const progressData = sessions.map(s => {
    const workout = workouts.find(w => w.date === s.date);
    const exercise = workout?.workoutExercises?.find((we: any) => we.exercise?.name === exerciseName);
    
    const weight = parseFloat(exercise?.weight) || 0;
    const reps = parseInt(exercise?.reps) || 0;
    const sets = parseInt(exercise?.sets) || 1;
    
    // Calculate Estimated 1-Rep Max using Brzycki formula: weight × (36 / (37 - reps))
    const e1RM = weight > 0 ? (reps > 1 ? weight * (36 / (37 - reps)) : weight) : reps;
    const volume = weight > 0 ? weight * reps * sets : reps * sets;
    
    return {
      date: s.date,
      weight,
      reps,
      sets,
      e1RM: Math.round(e1RM * 10) / 10, // Round to 1 decimal
      volume
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Determine chart values based on selected metric
  const values = chartMetric === "e1rm" 
    ? progressData.map(d => d.e1RM)
    : progressData.map(d => d.volume);
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  const padding = Math.max(range * 0.1, chartMetric === "e1rm" ? 5 : 50);
  const chartMin = Math.max(0, minValue - padding);
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;
  
  // Generate unique colors for each exercise
  const colors = [
    { line: "#3b82f6", gradient: "#e0f2fe" }, // blue
    { line: "#10b981", gradient: "#d1fae5" }, // green
    { line: "#f59e0b", gradient: "#fef3c7" }, // yellow
    { line: "#ef4444", gradient: "#fee2e2" }, // red
    { line: "#8b5cf6", gradient: "#ede9fe" }, // purple
    { line: "#06b6d4", gradient: "#cffafe" }, // cyan
  ];
  const colorIndex = exerciseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];
  
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        {exerciseName} Progress
      </h4>
      
      {/* Compact Chart Container */}
      <div className="relative h-32 bg-gray-50 rounded p-2">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-600 py-1">
          <span className="text-xs">{Math.round(chartMax)}</span>
          <span className="text-xs">{Math.round(chartMin)}</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 0.5, 1].map((ratio) => (
              <div
                key={ratio}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${ratio * 100}%` }}
              />
            ))}
          </div>
          
          {/* Progress line */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id={`gradient-${exerciseName}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color.gradient} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color.gradient} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            

            
            {/* Progress line */}
            <polyline
              points={values.map((value, index) => {
                const x = (index / (values.length - 1)) * 100;
                const y = 100 - ((value - chartMin) / chartRange) * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color.line}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {values.map((value, index) => {
              const x = (index / (values.length - 1)) * 100;
              const y = 100 - ((value - chartMin) / chartRange) * 100;
              const data = progressData[index];
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="2"
                    fill={color.line}
                    stroke="white"
                    strokeWidth="1"
                  />
                  <title>
                    {`${new Date(data.date).toLocaleDateString()}: ${
                      chartMetric === "e1rm" 
                        ? (data.weight > 0 ? `${data.e1RM} lbs e1RM` : `${data.e1RM} reps/set`)
                        : (data.weight > 0 ? `${data.volume} lbs volume` : `${data.volume} total reps`)
                    }`}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* Progress summary */}
      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <span>
          Latest: {progressData[progressData.length - 1].weight > 0 
            ? `${progressData[progressData.length - 1].weight} lbs` 
            : `${progressData[progressData.length - 1].reps} reps`}
        </span>
        <span>{progressData.length} sessions</span>
      </div>
    </div>
  );
}

// Exercise Progress View Component
function ExerciseProgressView({ 
  workouts, 
  selectedExercise, 
  setSelectedExercise, 
  chartMetric, 
  setChartMetric,
  exerciseFilter,
  setExerciseFilter,
  exercises
}: {
  workouts: any[];
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  chartMetric: "e1rm" | "volume";
  setChartMetric: (metric: "e1rm" | "volume") => void;
  exerciseFilter: "all" | "strength" | "cardio" | "functional";
  setExerciseFilter: (filter: "all" | "strength" | "cardio" | "functional") => void;
  exercises: any[];
}) {
  // Process workout data to extract exercise progress
  const exerciseProgress: { [key: string]: Array<{ date: string, volume: number, session: number, weight: number }> } = {};
  
  // Process all workouts to build exercise history
  (workouts as any[]).forEach((workout: any) => {
    if (workout.workoutExercises) {
      workout.workoutExercises.forEach((we: any) => {
        const exerciseName = we.exercise?.name || 'Unknown Exercise';
        if (!exerciseProgress[exerciseName]) {
          exerciseProgress[exerciseName] = [];
        }
        
        // Calculate total volume: weight × reps × sets
        const weight = parseFloat(we.weight) || 0;
        const reps = parseInt(we.reps) || 0;
        const sets = parseInt(we.sets) || 1;
        const totalVolume = weight * reps * sets;
        
        exerciseProgress[exerciseName].push({
          date: workout.date,
          volume: totalVolume,
          weight: weight, // Add the actual weight for "Latest" display
          session: exerciseProgress[exerciseName].length + 1
        });
      });
    }
  });
  
  // Sort sessions by date for each exercise
  Object.keys(exerciseProgress).forEach(exerciseName => {
    exerciseProgress[exerciseName].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Update session numbers after sorting
    exerciseProgress[exerciseName] = exerciseProgress[exerciseName].map((session, index) => ({
      ...session,
      session: index + 1
    }));
  });
  
  // Filter exercises by category
  const filteredExerciseProgress: { [key: string]: Array<{ date: string, volume: number, session: number, weight: number }> } = {};
  
  Object.keys(exerciseProgress).forEach(exerciseName => {
    const exercise = exercises?.find(ex => ex.name === exerciseName);
    const exerciseCategory = exercise?.category || 'strength';
    
    const shouldInclude = exerciseFilter === 'all' || 
      (exerciseFilter === 'strength' && exerciseCategory === 'strength') ||
      (exerciseFilter === 'cardio' && exerciseCategory === 'cardio') ||
      (exerciseFilter === 'functional' && exerciseCategory === 'functional');
    
    if (shouldInclude) {
      filteredExerciseProgress[exerciseName] = exerciseProgress[exerciseName];
    }
  });
  
  const exerciseNames = Object.keys(filteredExerciseProgress);
  
  return (
    <div className="space-y-6">
      {/* Category Filter and Metric Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setExerciseFilter("all")}
              className={`px-3 py-2 text-sm font-medium ${
                exerciseFilter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setExerciseFilter("strength")}
              className={`px-3 py-2 text-sm font-medium ${
                exerciseFilter === "strength" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Strength
            </button>
            <button
              onClick={() => setExerciseFilter("cardio")}
              className={`px-3 py-2 text-sm font-medium ${
                exerciseFilter === "cardio" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cardio
            </button>
            <button
              onClick={() => setExerciseFilter("functional")}
              className={`px-3 py-2 text-sm font-medium ${
                exerciseFilter === "functional" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Functional
            </button>
          </div>
        </div>
        
        {/* Metric Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Metric:</label>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setChartMetric("e1rm")}
              className={`px-4 py-2 text-sm font-medium ${
                chartMetric === "e1rm" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              e1RM
            </button>
            <button
              onClick={() => setChartMetric("volume")}
              className={`px-4 py-2 text-sm font-medium ${
                chartMetric === "volume" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>
      
      {/* All Exercise Charts Grid */}
      {exerciseNames.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {exerciseFilter === 'all' 
              ? 'No exercise data available yet.' 
              : `No ${exerciseFilter} exercises logged yet.`
            }
          </p>
          <p className="text-sm text-gray-400 mt-2">Start logging workouts to track your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exerciseNames.map((exerciseName) => (
            <CompactExerciseChart 
              key={exerciseName}
              exerciseName={exerciseName}
              sessions={filteredExerciseProgress[exerciseName]}
              workouts={workouts}
              chartMetric={chartMetric}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Exercise Chart Component
function RenderExerciseChart({ 
  exerciseName, 
  sessions, 
  workouts, 
  chartMetric 
}: { 
  exerciseName: string;
  sessions: any[];
  workouts: any[];
  chartMetric: "e1rm" | "volume";
}) {
  if (sessions.length < 1) return null;
  
  // Calculate e1RM and volume for each session
  const progressData = sessions.map(s => {
    const workout = workouts.find(w => w.date === s.date);
    const exercise = workout?.workoutExercises?.find((we: any) => we.exercise?.name === exerciseName);
    
    const weight = parseFloat(exercise?.weight) || 0;
    const reps = parseInt(exercise?.reps) || 0;
    const sets = parseInt(exercise?.sets) || 1;
    
    // Calculate Estimated 1-Rep Max using Brzycki formula: weight × (36 / (37 - reps))
    const e1RM = reps > 1 ? weight * (36 / (37 - reps)) : weight;
    const volume = weight * reps * sets;
    
    return {
      date: s.date,
      weight,
      reps,
      sets,
      e1RM: Math.round(e1RM * 10) / 10, // Round to 1 decimal
      volume
    };
  });
  
  // Determine chart values based on selected metric
  const values = chartMetric === "e1rm" 
    ? progressData.map(d => d.e1RM)
    : progressData.map(d => d.volume);
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  const padding = Math.max(range * 0.1, chartMetric === "e1rm" ? 5 : 50);
  const chartMin = Math.max(0, minValue - padding);
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;
  
  return (
    <div className="border rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {exerciseName} Progress ({chartMetric === "e1rm" ? "Estimated 1RM" : "Total Volume"})
      </h4>
      
      {/* Chart Container */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-600 py-4">
          <span>{Math.round(chartMax)} lbs</span>
          <span>{Math.round(chartMax - chartRange * 0.25)} lbs</span>
          <span>{Math.round(chartMax - chartRange * 0.5)} lbs</span>
          <span>{Math.round(chartMax - chartRange * 0.75)} lbs</span>
          <span>{Math.round(chartMin)} lbs</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-16 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <div
                key={ratio}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${ratio * 100}%` }}
              />
            ))}
          </div>
          
          {/* Progress line */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id={`gradient-${exerciseName}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            

            
            {/* Progress line */}
            <polyline
              points={values.map((value, index) => {
                const x = (index / (values.length - 1)) * 100;
                const y = 100 - ((value - chartMin) / chartRange) * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points with tooltips */}
            {values.map((value, index) => {
              const x = (index / (values.length - 1)) * 100;
              const y = 100 - ((value - chartMin) / chartRange) * 100;
              const data = progressData[index];
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <title>
                    {`Date: ${new Date(data.date).toLocaleDateString()}\nWeight: ${data.weight} lbs\nReps: ${data.reps}\nSets: ${data.sets}\ne1RM: ${data.e1RM} lbs\nVolume: ${data.volume} lbs`}
                  </title>
                </g>
              );
            })}
          </svg>
          
          {/* X-axis labels with dates */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 pt-2">
            {progressData.map((data, index) => (
              <span key={index} className="text-center">
                {new Date(data.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Progress summary */}
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-gray-600">
          Latest: {chartMetric === "e1rm" 
            ? `${progressData[progressData.length - 1].e1RM} lbs e1RM`
            : `${progressData[progressData.length - 1].volume} lbs volume`
          }
        </span>
      </div>
    </div>
  );
}

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
  const [workoutTab, setWorkoutTab] = useState("log-workout");
  const [workoutSession, setWorkoutSession] = useState<any[]>([]);
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  // Progress chart controls
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [chartMetric, setChartMetric] = useState<"e1rm" | "volume">("e1rm");
  const [exerciseFilter, setExerciseFilter] = useState<"all" | "strength" | "cardio" | "functional">("all");
  
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
      // Reset workout date to today for next workout
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setWorkoutDate(`${year}-${month}-${day}`);
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

  // Update exercise category mutation
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, category }: { exerciseId: number; category: string }) => {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category }),
      });
      if (!response.ok) throw new Error("Failed to update exercise");
      return response.json();
    },
    onSuccess: (updatedExercise) => {
      // Update the cache with the updated exercise
      queryClient.setQueryData(["/api/exercises"], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((exercise: any) => 
          exercise.id === updatedExercise.id 
            ? { ...exercise, category: updatedExercise.category }
            : exercise
        );
      });
      
      toast({
        title: "Exercise updated",
        description: `"${updatedExercise.name}" category updated to ${updatedExercise.category}.`,
      });
    },
  });

  // Delete workout mutation
  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Workout deleted",
        description: "The workout has been removed from your history.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting workout",
        description: error.message || "Failed to delete workout. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteWorkout = (workoutId: number) => {
    deleteWorkoutMutation.mutate(workoutId);
  };

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
              <TabsTrigger value="log-workout">Log Workout</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="workout-history">Workout History</TabsTrigger>
            </TabsList>

            <TabsContent value="workout-history" className="mt-6">
              <div className="space-y-6">
                {/* Workout History */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Workout History</h3>
                  
                  {workoutsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading workout history...</p>
                    </div>
                  ) : workouts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No workouts recorded yet.</p>
                      <p className="text-sm text-gray-400 mt-2">Start logging workouts to see your history here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workouts.map((workout: any) => (
                        <div key={workout.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{workout.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(workout.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm font-medium text-blue-600">
                                  {workout.duration ? `${workout.duration} min` : 'Duration not recorded'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(workout.createdAt).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteWorkout(workout.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title="Delete workout"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Exercise Details */}
                          {workout.workoutExercises && workout.workoutExercises.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <h5 className="text-sm font-medium text-gray-700">Exercises:</h5>
                              <div className="space-y-1">
                                {workout.workoutExercises.map((we: any) => (
                                  <div key={we.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span className="font-medium text-gray-900">{we.exercise?.name || 'Unknown Exercise'}</span>
                                    <div className="flex gap-3 text-gray-600">
                                      {we.weight && (
                                        <span className="text-black">{we.weight} lbs</span>
                                      )}
                                      {we.reps && (
                                        <span className="text-black">{we.reps} reps</span>
                                      )}
                                      {we.sets && (
                                        <span className="text-black">{we.sets} sets</span>
                                      )}
                                      {we.distance && (
                                        <span className="text-black">{we.distance}m</span>
                                      )}
                                      {we.duration && (
                                        <span className="text-black">{we.duration} min</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Workout Notes */}
                          {workout.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-black"><strong>Workout Notes:</strong> {workout.notes}</p>
                            </div>
                          )}
                          
                          {/* Exercise Notes */}
                          {workout.workoutExercises && workout.workoutExercises.some((we: any) => we.notes) && (
                            <div className="mt-3 space-y-2">
                              <h5 className="text-sm font-medium text-black">Exercise Notes:</h5>
                              {workout.workoutExercises.filter((we: any) => we.notes).map((we: any) => (
                                <div key={we.id} className="p-2 bg-gray-50 rounded text-sm">
                                  <span className="font-medium text-black">{we.exercise?.name}:</span> 
                                  <span className="text-black ml-1">{we.notes}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                          <Select onValueChange={(newCategory) => {
                            field.onChange(newCategory);
                            
                            // If an exercise is selected and the category is manually changed, update the exercise
                            const selectedExerciseName = workoutForm.getValues("exerciseName");
                            if (selectedExerciseName && exercises && Array.isArray(exercises)) {
                              const selectedExercise = exercises.find((ex: any) => ex.name === selectedExerciseName);
                              if (selectedExercise && selectedExercise.id && selectedExercise.category !== newCategory) {
                                updateExerciseMutation.mutate({
                                  exerciseId: selectedExercise.id,
                                  category: newCategory
                                });
                              }
                            }
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="py-0 h-10 items-center">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strength">
                                <div className="flex flex-col py-1">
                                  <span>Strength</span>
                                  <span className="text-xs text-white/80 data-[highlighted]:text-white">Focused on building muscle and increasing load capacity</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cardio">
                                <div className="flex flex-col py-1">
                                  <span>Cardio</span>
                                  <span className="text-xs text-white/80 data-[highlighted]:text-white">Focused on endurance, heart rate, and aerobic capacity</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="functional">
                                <div className="flex flex-col py-1">
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
              <div className="space-y-6">
                {/* Exercise Progress Charts */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Exercise Progress</h3>
                  
                  {workoutsLoading || exercisesLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading progress data...</p>
                    </div>
                  ) : (
                    <ExerciseProgressView 
                      workouts={workouts as any[]}
                      selectedExercise={selectedExercise}
                      setSelectedExercise={setSelectedExercise}
                      chartMetric={chartMetric}
                      setChartMetric={setChartMetric}
                      exerciseFilter={exerciseFilter}
                      setExerciseFilter={setExerciseFilter}
                      exercises={exercises as any[]}
                    />
                  )}
                </div>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return (workouts as any[]).filter(w => new Date(w.date) >= oneWeekAgo).length;
                    })()}
                  </div>
                  <div className="text-sm text-blue-700">This Week</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{(workouts as any[]).length}</div>
                  <div className="text-sm text-green-700">Total Workouts</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {(() => {
                      const sortedWorkouts = [...(workouts as any[])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      if (sortedWorkouts.length > 0) {
                        const lastWorkoutDate = new Date(sortedWorkouts[0].date);
                        const today = new Date();
                        const diffTime = today.getTime() - lastWorkoutDate.getTime();
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays === 0) return "Today";
                        if (diffDays === 1) return "Yesterday";
                        return `${diffDays} days ago`;
                      }
                      return "None";
                    })()}
                  </div>
                  <div className="text-sm text-orange-700">Last Workout</div>
                </div>
              </div>

              {/* Category Trends Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Category Trends</h4>
                  <div className="flex space-x-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                      <span className="text-gray-600">Strength</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-gray-600">Cardio</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                      <span className="text-gray-600">Functional</span>
                    </div>
                  </div>
                </div>
                
                {/* Real Category Progress Chart */}
                <div className="relative h-32 bg-white rounded border">
                  {(() => {
                    // Process workout data to get category performance trends
                    const categoryData: Record<string, { date: string; performance: number }[]> = { 
                      strength: [], 
                      cardio: [], 
                      functional: [] 
                    };
                    const sortedWorkouts = [...(workouts as any[])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    
                    sortedWorkouts.forEach(workout => {
                      if (workout.workoutExercises) {
                        const categoryPerformance = { strength: 0, cardio: 0, functional: 0 };
                        
                        workout.workoutExercises.forEach((we: any) => {
                          const exercise = (exercises as any[]).find((ex: any) => ex.id === we.exerciseId);
                          if (exercise) {
                            // Calculate e1RM for this exercise
                            const weight = we.weight || 0;
                            const reps = we.reps || 0;
                            let e1rm = 0;
                            
                            if (weight > 0 && reps > 0) {
                              // Weighted exercise
                              e1rm = weight * 36 / (37 - reps);
                            } else if (reps > 0) {
                              // Bodyweight exercise
                              e1rm = reps;
                            }
                            
                            // Add to appropriate category
                            if (exercise.category === 'strength') {
                              categoryPerformance.strength += e1rm;
                            } else if (exercise.category === 'cardio') {
                              categoryPerformance.cardio += e1rm;
                            } else if (exercise.category === 'functional') {
                              categoryPerformance.functional += e1rm;
                            }
                          }
                        });
                        
                        // Add data points for each category
                        categoryData.strength.push({ date: workout.date, performance: categoryPerformance.strength });
                        categoryData.cardio.push({ date: workout.date, performance: categoryPerformance.cardio });
                        categoryData.functional.push({ date: workout.date, performance: categoryPerformance.functional });
                      }
                    });
                    
                    if (sortedWorkouts.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                          No workout data available yet
                        </div>
                      );
                    }
                    
                    // Generate SVG points for each category
                    const chartWidth = 280;
                    const chartHeight = 80;
                    const maxPerformance = Math.max(
                      ...categoryData.strength.map(d => d.performance),
                      ...categoryData.cardio.map(d => d.performance),
                      ...categoryData.functional.map(d => d.performance),
                      1
                    );
                    
                    const generatePoints = (data: { date: string; performance: number }[], color: string) => {
                      if (data.length === 0 || data.every(d => d.performance === 0)) return null;
                      
                      const points = data.map((d, i) => {
                        const x = 20 + (i / Math.max(data.length - 1, 1)) * chartWidth;
                        const y = chartHeight - (d.performance / maxPerformance) * (chartHeight - 20) + 10;
                        return `${x},${y}`;
                      }).join(' ');
                      
                      return (
                        <polyline
                          key={color}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                      );
                    };
                    
                    return (
                      <svg viewBox="0 0 320 100" className="w-full h-full">
                        {/* Grid lines */}
                        <defs>
                          <pattern id="dashGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dashGrid)" />
                        
                        {generatePoints(categoryData.strength, "#8b5cf6")}
                        {generatePoints(categoryData.cardio, "#10b981")}
                        {generatePoints(categoryData.functional, "#3b82f6")}
                      </svg>
                    );
                  })()}
                </div>
                
                <div className="text-center mt-3">
                  <p className="text-xs text-gray-500">Exercise category trends across workouts</p>
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