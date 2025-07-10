import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save } from 'lucide-react';

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

const TrainingProgramCreator: React.FC = () => {
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [program, setProgram] = useState<TrainingProgram>({});

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
    console.log('Saving template:', program);
    // TODO: Implement save functionality
  };

  if (!showTemplate) {
    return (
      <Card className="border-0 shadow-lg h-full">
        <CardContent className="flex items-center justify-center h-full min-h-[400px]">
          <Button 
            onClick={() => setShowTemplate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Create a 4-Week Training Plan
          </Button>
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
                <Input
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) => updateExercise('warmup', 0, index, 'name', e.target.value)}
                  className="font-medium"
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
                  <Input
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChange={(e) => updateExercise('blocks', blockIndex, exerciseIndex, 'name', e.target.value)}
                    className="font-medium"
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