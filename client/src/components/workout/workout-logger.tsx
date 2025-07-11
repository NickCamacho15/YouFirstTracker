import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Activity, Zap, Save, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WorkoutLoggerProps {
  weekNumber: number;
  dayNumber: number;
  blockLetter: string;
}

interface WorkoutEntry {
  id?: number;
  category: "strength" | "cardio" | "functional";
  exerciseName: string;
  // Strength fields
  weight?: number;
  reps?: number;
  // Cardio fields
  time?: number;
  calories?: number;
  effort?: number;
  // Functional fields
  duration?: number;
  // Common fields
  notes?: string;
}

export default function WorkoutLogger({ weekNumber, dayNumber, blockLetter }: WorkoutLoggerProps) {
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<WorkoutEntry>({
    category: "strength",
    exerciseName: "",
    notes: ""
  });
  const [isAdding, setIsAdding] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load existing workout entries for this day/block
  const { data: existingEntries = [] } = useQuery({
    queryKey: [`/api/workouts/entries/${weekNumber}/${dayNumber}/${blockLetter}`],
  });

  // Save workout entry
  const saveEntryMutation = useMutation({
    mutationFn: async (entry: WorkoutEntry) => {
      const response = await apiRequest("POST", "/api/workouts/entries", {
        ...entry,
        weekNumber,
        dayNumber,
        blockLetter,
        date: new Date().toISOString().split('T')[0]
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/entries/${weekNumber}/${dayNumber}/${blockLetter}`] });
      toast({ title: "Workout logged!", description: "Your workout has been saved." });
      setCurrentEntry({
        category: "strength",
        exerciseName: "",
        notes: ""
      });
      setIsAdding(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save workout",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (category: "strength" | "cardio" | "functional") => {
    setCurrentEntry({
      category,
      exerciseName: currentEntry.exerciseName,
      notes: currentEntry.notes
    });
  };

  const handleSaveEntry = () => {
    if (!currentEntry.exerciseName.trim()) {
      toast({
        title: "Exercise name required",
        description: "Please enter an exercise name.",
        variant: "destructive",
      });
      return;
    }
    
    saveEntryMutation.mutate(currentEntry);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return <Dumbbell className="w-4 h-4" />;
      case "cardio": return <Activity className="w-4 h-4" />;
      case "functional": return <Zap className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strength": return "bg-blue-500";
      case "cardio": return "bg-green-500";
      case "functional": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">Block {blockLetter}</span>
            <span className="text-sm text-gray-600">Week {weekNumber} • Day {dayNumber}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Entries */}
        {existingEntries.length > 0 && (
          <div className="space-y-2">
            {existingEntries.map((entry: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getCategoryColor(entry.category)} text-white`}>
                    {getCategoryIcon(entry.category)}
                    {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                  </Badge>
                  <span className="font-medium">{entry.exerciseName}</span>
                </div>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  {entry.category === "strength" && (
                    <>
                      {entry.weight && <span>Weight: {entry.weight} lbs</span>}
                      {entry.reps && <span>Reps: {entry.reps}</span>}
                    </>
                  )}
                  {entry.category === "cardio" && (
                    <>
                      {entry.time && <span>Time: {formatTime(entry.time)}</span>}
                      {entry.calories && <span>Calories: {entry.calories}</span>}
                      {entry.effort && <span>Effort: {entry.effort}/10</span>}
                    </>
                  )}
                  {entry.category === "functional" && (
                    <>
                      {entry.duration && <span>Duration: {formatTime(entry.duration)}</span>}
                    </>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Entry Form */}
        {isAdding && (
          <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Select value={currentEntry.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      Strength
                    </div>
                  </SelectItem>
                  <SelectItem value="cardio">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Cardio
                    </div>
                  </SelectItem>
                  <SelectItem value="functional">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Functional
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Exercise name"
                value={currentEntry.exerciseName}
                onChange={(e) => setCurrentEntry({...currentEntry, exerciseName: e.target.value})}
                className="flex-1"
              />
            </div>

            {/* Category-specific fields */}
            {currentEntry.category === "strength" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={currentEntry.weight || ''}
                    onChange={(e) => setCurrentEntry({...currentEntry, weight: parseInt(e.target.value) || undefined})}
                    placeholder="135"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={currentEntry.reps || ''}
                    onChange={(e) => setCurrentEntry({...currentEntry, reps: parseInt(e.target.value) || undefined})}
                    placeholder="8"
                  />
                </div>
              </div>
            )}

            {currentEntry.category === "cardio" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="time">Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={currentEntry.time ? Math.floor(currentEntry.time / 60) : ''}
                    onChange={(e) => setCurrentEntry({...currentEntry, time: (parseInt(e.target.value) || 0) * 60})}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="calories">Calories (optional)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={currentEntry.calories || ''}
                    onChange={(e) => setCurrentEntry({...currentEntry, calories: parseInt(e.target.value) || undefined})}
                    placeholder="300"
                  />
                </div>
                <div>
                  <Label htmlFor="effort">Effort 1-10 (optional)</Label>
                  <Input
                    id="effort"
                    type="number"
                    min="1"
                    max="10"
                    value={currentEntry.effort || ''}
                    onChange={(e) => setCurrentEntry({...currentEntry, effort: parseInt(e.target.value) || undefined})}
                    placeholder="7"
                  />
                </div>
              </div>
            )}

            {currentEntry.category === "functional" && (
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={currentEntry.duration ? Math.floor(currentEntry.duration / 60) : ''}
                  onChange={(e) => setCurrentEntry({...currentEntry, duration: (parseInt(e.target.value) || 0) * 60})}
                  placeholder="45"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={currentEntry.notes || ''}
                onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                placeholder="Any additional notes about this exercise..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setCurrentEntry({
                    category: "strength",
                    exerciseName: "",
                    notes: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEntry}
                disabled={saveEntryMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saveEntryMutation.isPending ? 'Saving...' : 'Save Exercise'}
              </Button>
            </div>
          </div>
        )}

        {existingEntries.length === 0 && !isAdding && (
          <div className="text-center py-6 text-gray-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No exercises logged for this block yet.</p>
            <p className="text-sm">Click "Add Exercise" to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}