import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Save, Weight, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: number;
  name: string;
  category: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export function WorkoutLogger() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: 3,
    reps: 10,
    weight: 0,
    notes: ""
  });

  // Common exercises for quick selection
  const commonExercises = [
    "Push-ups", "Pull-ups", "Squats", "Deadlifts", "Bench Press", "Overhead Press",
    "Barbell Rows", "Bicep Curls", "Tricep Dips", "Planks", "Lunges", "Burpees"
  ];

  const createWorkout = useMutation({
    mutationFn: async (workoutData: any) => {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
      });
      if (!response.ok) throw new Error('Failed to create workout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Workout logged!",
        description: "Your workout has been successfully recorded.",
      });
      // Reset form
      setWorkoutName("");
      setWorkoutDate(new Date().toISOString().split('T')[0]);
      setWorkoutNotes("");
      setExercises([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addExercise = () => {
    if (!newExercise.name.trim()) return;
    
    const exercise: Exercise = {
      id: Date.now(),
      name: newExercise.name,
      category: "strength",
      sets: newExercise.sets,
      reps: newExercise.reps,
      weight: newExercise.weight,
      notes: newExercise.notes
    };
    
    setExercises([...exercises, exercise]);
    setNewExercise({
      name: "",
      sets: 3,
      reps: 10,
      weight: 0,
      notes: ""
    });
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: number, field: string, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const handleSubmit = () => {
    if (!workoutName.trim()) {
      toast({
        title: "Workout name required",
        description: "Please enter a name for your workout.",
        variant: "destructive",
      });
      return;
    }

    const workoutData = {
      name: workoutName,
      date: workoutDate,
      notes: workoutNotes,
      duration: 45, // Default duration
      exercises: exercises
    };

    createWorkout.mutate(workoutData);
  };

  return (
    <div className="space-y-6">
      
      {/* Workout Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Log New Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workout-name">Workout Name</Label>
              <Input
                id="workout-name"
                placeholder="e.g., Upper Body Strength"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="workout-date">Date</Label>
              <Input
                id="workout-date"
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="workout-notes">Notes (optional)</Label>
            <Textarea
              id="workout-notes"
              placeholder="How did the workout feel? Any observations or adjustments..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Exercise */}
      <Card>
        <CardHeader>
          <CardTitle>Add Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Select 
                value={newExercise.name} 
                onValueChange={(value) => setNewExercise({...newExercise, name: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {commonExercises.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="sets">Sets</Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewExercise({...newExercise, sets: Math.max(1, newExercise.sets - 1)})}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    id="sets"
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 1})}
                    className="mx-1 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewExercise({...newExercise, sets: newExercise.sets + 1})}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({...newExercise, reps: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise({...newExercise, weight: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          
          <Button onClick={addExercise} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add to Session
          </Button>
        </CardContent>
      </Card>

      {/* Current Session */}
      {exercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && exercise.weight > 0 && ` @ ${exercise.weight} lbs`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Body Weight Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="w-5 h-5" />
            Body Weight Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current-weight">Current Weight (lbs)</Label>
              <Input
                id="current-weight"
                type="number"
                step="0.1"
                placeholder="173.5"
              />
            </div>
            <div>
              <Label htmlFor="weight-date">Date</Label>
              <Input
                id="weight-date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            Log Weight
          </Button>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit} 
        disabled={createWorkout.isPending}
        className="w-full"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        {createWorkout.isPending ? "Saving..." : "Save Workout"}
      </Button>

    </div>
  );
}