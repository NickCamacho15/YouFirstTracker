import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Exercise {
  name: string;
  load: string;
  notes: string;
}

interface WorkoutBlock {
  name: string;
  exercises: Exercise[];
}

interface DayWorkout {
  warmup: Exercise[];
  blocks: WorkoutBlock[];
}

interface TrainingProgram {
  [week: number]: {
    [day: number]: DayWorkout;
  };
}

interface TrainingTemplate {
  id: number;
  name: string;
  description?: string;
  templateData: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseHistoryItem {
  id: number;
  exerciseName: string;
  category?: string;
  usageCount: number;
  lastUsed: string;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  category?: string;
}

const ExerciseAutocomplete: React.FC<AutocompleteProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  category 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/exercise-history/search', searchTerm],
    queryFn: () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      return fetch(`/api/exercise-history/search?q=${encodeURIComponent(searchTerm)}`).then(r => r.json());
    },
    enabled: searchTerm.length >= 2,
  });

  const addToHistoryMutation = useMutation({
    mutationFn: (exerciseData: { exerciseName: string; category?: string }) =>
      apiRequest('/api/exercise-history', { method: 'POST', body: exerciseData }),
    onError: (error) => {
      console.error('Error adding exercise to history:', error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowSuggestions(newValue.length >= 2);
  };

  const handleSuggestionClick = (exerciseName: string) => {
    onChange(exerciseName);
    setSearchTerm('');
    setShowSuggestions(false);
    
    // Add to history when selected
    addToHistoryMutation.mutate({ exerciseName, category });
  };

  const handleBlur = () => {
    // Add to history on blur if user typed something new
    if (value && value.trim()) {
      addToHistoryMutation.mutate({ exerciseName: value.trim(), category });
    }
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((item: ExerciseHistoryItem) => (
            <div
              key={item.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => handleSuggestionClick(item.exerciseName)}
            >
              <span>{item.exerciseName}</span>
              <span className="text-xs text-gray-500">Used {item.usageCount}x</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TrainingProgramCreator: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [program, setProgram] = useState<TrainingProgram>({});
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for active template on load
  const { data: activeTemplate, isLoading: loadingTemplate } = useQuery({
    queryKey: ['/api/training-templates/active'],
    queryFn: () => fetch('/api/training-templates/active').then(r => r.json()),
  });

  // Load active template into state
  useEffect(() => {
    if (activeTemplate && activeTemplate.templateData) {
      try {
        const parsedProgram = JSON.parse(activeTemplate.templateData);
        setProgram(parsedProgram);
        setTemplateName(activeTemplate.name);
        setTemplateDescription(activeTemplate.description || '');
      } catch (error) {
        console.error('Error parsing template data:', error);
      }
    }
  }, [activeTemplate]);

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData: { name: string; description: string; templateData: string }) =>
      apiRequest('/api/training-templates', { method: 'POST', body: templateData }),
    onSuccess: () => {
      toast({ title: "Template saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/training-templates/active'] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to save template", 
        description: "Please try again.", 
        variant: "destructive" 
      });
    },
  });

  // Initialize empty workout if doesn't exist
  const getCurrentWorkout = (): DayWorkout => {
    if (!program[selectedWeek]?.[selectedDay]) {
      return {
        warmup: [
          { name: 'Warm-up 1', load: '', notes: '' },
          { name: 'Warm-up 2', load: '', notes: '' }
        ],
        blocks: [
          {
            name: 'Block A',
            exercises: [
              { name: 'Block A Exercise 1', load: '', notes: '' },
              { name: 'Block A Exercise 2', load: '', notes: '' }
            ]
          },
          {
            name: 'Block B',
            exercises: [
              { name: 'Block B Exercise 1', load: '', notes: '' },
              { name: 'Block B Exercise 2', load: '', notes: '' }
            ]
          },
          {
            name: 'Block C',
            exercises: [
              { name: 'Block C Exercise 1', load: '', notes: '' },
              { name: 'Block C Exercise 2', load: '', notes: '' },
              { name: 'Block C Exercise 3', load: '', notes: '' }
            ]
          }
        ]
      };
    }
    return program[selectedWeek][selectedDay];
  };

  const updateWorkout = (workout: DayWorkout) => {
    setProgram(prev => ({
      ...prev,
      [selectedWeek]: {
        ...prev[selectedWeek],
        [selectedDay]: workout
      }
    }));
  };

  const updateExercise = (section: 'warmup' | 'blocks', blockIndex: number, exerciseIndex: number, field: keyof Exercise, value: string) => {
    const currentWorkout = getCurrentWorkout();
    
    if (section === 'warmup') {
      const newWarmup = [...currentWorkout.warmup];
      newWarmup[exerciseIndex] = { ...newWarmup[exerciseIndex], [field]: value };
      updateWorkout({ ...currentWorkout, warmup: newWarmup });
    } else {
      const newBlocks = [...currentWorkout.blocks];
      newBlocks[blockIndex].exercises[exerciseIndex] = { 
        ...newBlocks[blockIndex].exercises[exerciseIndex], 
        [field]: value 
      };
      updateWorkout({ ...currentWorkout, blocks: newBlocks });
    }
  };

  const addExerciseToBlock = (blockIndex: number) => {
    const currentWorkout = getCurrentWorkout();
    const newBlocks = [...currentWorkout.blocks];
    newBlocks[blockIndex].exercises.push({ 
      name: `${newBlocks[blockIndex].name} Exercise ${newBlocks[blockIndex].exercises.length + 1}`, 
      load: '', 
      notes: '' 
    });
    updateWorkout({ ...currentWorkout, blocks: newBlocks });
  };

  const addBlock = () => {
    const currentWorkout = getCurrentWorkout();
    const blockLetter = String.fromCharCode(65 + currentWorkout.blocks.length); // A, B, C, D, etc.
    const newBlock: WorkoutBlock = {
      name: `Block ${blockLetter}`,
      exercises: [
        { name: `Block ${blockLetter} Exercise 1`, load: '', notes: '' },
        { name: `Block ${blockLetter} Exercise 2`, load: '', notes: '' }
      ]
    };
    updateWorkout({ ...currentWorkout, blocks: [...currentWorkout.blocks, newBlock] });
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast({ 
        title: "Template name required", 
        description: "Please enter a name for your template.", 
        variant: "destructive" 
      });
      return;
    }

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      templateData: JSON.stringify(program)
    };

    saveTemplateMutation.mutate(templateData);
  };

  // Show loading state while checking for active template
  if (loadingTemplate) {
    return (
      <Card className="border-0 shadow-lg h-full">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading template...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show create button if no active template exists and no local program
  if (!activeTemplate && Object.keys(program).length === 0) {
    return (
      <Card className="border-0 shadow-lg h-full">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center space-y-4">
            <Button 
              onClick={() => {
                // Create an initial empty template structure
                const initialProgram: TrainingProgram = {};
                setProgram(initialProgram);
                setTemplateName('My Training Program');
                setTemplateDescription('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              Create a 4-Week Training Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentWorkout = getCurrentWorkout();

  return (
    <Card className="border-0 shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">4-Week Training Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Metadata */}
        <div className="space-y-3 pb-4 border-b">
          <Input
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="font-semibold text-lg"
          />
          <Textarea
            placeholder="Template description (optional)"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Week Tabs */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((week) => (
            <Button
              key={week}
              variant={selectedWeek === week ? "default" : "outline"}
              onClick={() => setSelectedWeek(week)}
              className="flex-1"
            >
              Week {week}
            </Button>
          ))}
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "outline"}
              onClick={() => setSelectedDay(day)}
              className="flex-1"
            >
              Day {day}
            </Button>
          ))}
        </div>

        {/* Workout Content - Scrollable */}
        <div className="max-h-96 overflow-y-auto space-y-6">
          {/* Warm-up Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Warm-up</h3>
            {currentWorkout.warmup.map((exercise, index) => (
              <div key={index} className="space-y-2">
                <ExerciseAutocomplete
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(value) => updateExercise('warmup', 0, index, 'name', value)}
                  className="font-medium"
                  category="warmup"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Load/Effort</label>
                    <Input
                      placeholder="e.g., 3x10 or 60%"
                      value={exercise.load}
                      onChange={(e) => updateExercise('warmup', 0, index, 'load', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <Input
                      placeholder="Notes"
                      value={exercise.notes}
                      onChange={(e) => updateExercise('warmup', 0, index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workout Blocks */}
          {currentWorkout.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{block.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addExerciseToBlock(blockIndex)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Exercise
                </Button>
              </div>
              
              {block.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="space-y-2">
                  <ExerciseAutocomplete
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChange={(value) => updateExercise('blocks', blockIndex, exerciseIndex, 'name', value)}
                    className="font-medium"
                    category={`block_${String.fromCharCode(97 + blockIndex)}`} // block_a, block_b, etc.
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Load/Effort</label>
                      <Input
                        placeholder="e.g., 3x10 or 60%"
                        value={exercise.load}
                        onChange={(e) => updateExercise('blocks', blockIndex, exerciseIndex, 'load', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <Input
                        placeholder="Notes"
                        value={exercise.notes}
                        onChange={(e) => updateExercise('blocks', blockIndex, exerciseIndex, 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Add Block Button */}
          <Button
            variant="outline"
            onClick={addBlock}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={saveTemplate}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingProgramCreator;