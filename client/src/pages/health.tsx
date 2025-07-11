import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Activity, Trophy, Play } from "lucide-react";

export default function HealthPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleDay = (weekNumber: number, dayNumber: number) => {
    const key = `${weekNumber}-${dayNumber}`;
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedDays(newExpanded);
  };

  const getWeekDates = (weekNumber: number) => {
    const today = new Date();
    const startOfProgram = new Date(today);
    startOfProgram.setDate(today.getDate() - ((weekNumber - 1) * 7));
    
    const endOfWeek = new Date(startOfProgram);
    endOfWeek.setDate(startOfProgram.getDate() + 6);
    
    return {
      start: startOfProgram.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      end: endOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const getDayDate = (weekNumber: number, dayNumber: number) => {
    const today = new Date();
    const startOfProgram = new Date(today);
    startOfProgram.setDate(today.getDate() - ((weekNumber - 1) * 7) + (dayNumber - 1));
    
    return startOfProgram.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Static 4-week template
  const staticProgram = {
    program: {
      name: "4-Week Elite Training Program",
      description: "Comprehensive strength and conditioning program designed for maximum results"
    },
    weeks: [
      {
        weekNumber: 1,
        phase: "Load",
        phaseDescription: "Building foundation with progressive overload",
        days: [
          {
            dayNumber: 1,
            name: "Upper Power",
            blocks: [
              {
                name: "Strength Focus",
                exercises: [
                  { exerciseName: "Bench Press", sets: "4", reps: "5", weight: "85%" },
                  { exerciseName: "Weighted Pull-ups", sets: "4", reps: "6", weight: "BW+25" },
                  { exerciseName: "Overhead Press", sets: "3", reps: "8", weight: "75%" }
                ]
              },
              {
                name: "Accessory Work",
                exercises: [
                  { exerciseName: "Barbell Rows", sets: "3", reps: "10", weight: "70%" },
                  { exerciseName: "Dips", sets: "3", reps: "12", weight: "BW" },
                  { exerciseName: "Face Pulls", sets: "3", reps: "15", weight: "Light" }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: "Lower Power",
            blocks: [
              {
                name: "Strength Focus",
                exercises: [
                  { exerciseName: "Back Squat", sets: "4", reps: "5", weight: "85%" },
                  { exerciseName: "Romanian Deadlift", sets: "3", reps: "8", weight: "75%" },
                  { exerciseName: "Bulgarian Split Squats", sets: "3", reps: "10", weight: "BW" }
                ]
              }
            ]
          }
        ]
      },
      {
        weekNumber: 2,
        phase: "Load",
        phaseDescription: "Increasing intensity and volume",
        days: [
          {
            dayNumber: 1,
            name: "Upper Power",
            blocks: [
              {
                name: "Strength Focus",
                exercises: [
                  { exerciseName: "Bench Press", sets: "4", reps: "4", weight: "87%" },
                  { exerciseName: "Weighted Pull-ups", sets: "4", reps: "5", weight: "BW+30" },
                  { exerciseName: "Overhead Press", sets: "3", reps: "7", weight: "77%" }
                ]
              }
            ]
          }
        ]
      },
      {
        weekNumber: 3,
        phase: "Peak",
        phaseDescription: "Maximum intensity phase",
        days: [
          {
            dayNumber: 1,
            name: "Upper Power",
            blocks: [
              {
                name: "Strength Focus",
                exercises: [
                  { exerciseName: "Bench Press", sets: "5", reps: "3", weight: "90%" },
                  { exerciseName: "Weighted Pull-ups", sets: "5", reps: "4", weight: "BW+35" },
                  { exerciseName: "Overhead Press", sets: "4", reps: "6", weight: "80%" }
                ]
              }
            ]
          }
        ]
      },
      {
        weekNumber: 4,
        phase: "Deload",
        phaseDescription: "Recovery and adaptation",
        days: [
          {
            dayNumber: 1,
            name: "Upper Power",
            blocks: [
              {
                name: "Strength Focus",
                exercises: [
                  { exerciseName: "Bench Press", sets: "3", reps: "6", weight: "70%" },
                  { exerciseName: "Weighted Pull-ups", sets: "3", reps: "8", weight: "BW+15" },
                  { exerciseName: "Overhead Press", sets: "3", reps: "10", weight: "65%" }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Ultra Compact Header */}
      <div className="bg-white shadow-md border-b">
        <div className="px-3">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <h1 className="text-base font-bold text-gray-900">Body</h1>
                <p className="text-xs text-gray-600">Elite Training Program</p>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs shadow-md"
            >
              <Play className="h-3 w-3 mr-1" />
              Start Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Content */}
      <div className="px-2 py-3">
        <div className="space-y-2">
          {/* Program Overview */}
          <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-blue-600" />
              4-Week Elite Training Program
            </h3>
            <p className="text-xs text-gray-600 mb-2">Comprehensive strength and conditioning program designed for maximum results</p>
            
            {/* Compact Phase Overview */}
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((week) => {
                const phase = week <= 2 ? "Load" : week === 3 ? "Peak" : "Deload";
                
                return (
                  <div key={week} className={`rounded p-1.5 border text-center shadow-sm ${
                    phase === "Load" ? "border-blue-300 bg-blue-50" :
                    phase === "Peak" ? "border-red-300 bg-red-50" :
                    "border-green-300 bg-green-50"
                  }`}>
                    <div className="text-xs font-medium text-gray-700">W{week}</div>
                    <div className={`text-xs font-bold ${
                      phase === "Load" ? "text-blue-600" :
                      phase === "Peak" ? "text-red-600" :
                      "text-green-600"
                    }`}>{phase}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Week Dropdowns */}
          <div className="space-y-1">
            {staticProgram.weeks.map((week) => {
              const weekDates = getWeekDates(week.weekNumber);
              const isExpanded = expandedWeeks.has(week.weekNumber);
              
              return (
                <div key={week.weekNumber} className="bg-white rounded-lg shadow-md border border-blue-200">
                  {/* Week Header */}
                  <button
                    onClick={() => toggleWeek(week.weekNumber)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-semibold text-blue-600">
                        Week {week.weekNumber}: {week.phase}
                      </div>
                      <div className="text-xs text-gray-500">
                        {weekDates.start} - {weekDates.end}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-blue-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Week Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1">
                      <p className="text-xs text-gray-600 mb-2">{week.phaseDescription}</p>
                      
                      {/* Day Blocks */}
                      <div className="space-y-1">
                        {week.days.map((day) => {
                          const dayKey = `${week.weekNumber}-${day.dayNumber}`;
                          const isDayExpanded = expandedDays.has(dayKey);
                          const dayDate = getDayDate(week.weekNumber, day.dayNumber);
                          
                          return (
                            <div key={day.dayNumber} className="border border-gray-200 rounded shadow-sm">
                              {/* Day Header */}
                              <button
                                onClick={() => toggleDay(week.weekNumber, day.dayNumber)}
                                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    Day {day.dayNumber}: {day.name}
                                  </span>
                                  <span className="text-xs text-gray-500">{dayDate}</span>
                                </div>
                                <ChevronDown className={`h-3 w-3 text-gray-600 transform transition-transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Day Workout Blocks */}
                              {isDayExpanded && (
                                <div className="px-3 pb-3 space-y-1 bg-gray-50">
                                  {day.blocks.map((block, idx) => (
                                    <div key={idx} className="bg-white rounded p-2 border shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-blue-600">
                                          Block {String.fromCharCode(65 + idx)}: {block.name}
                                        </span>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-xs px-2 py-1 h-6"
                                        >
                                          Enter
                                        </Button>
                                      </div>
                                      
                                      {/* Exercise Preview */}
                                      <div className="space-y-0.5">
                                        {block.exercises.slice(0, 2).map((exercise, exIdx) => (
                                          <div key={exIdx} className="text-xs text-gray-600 flex justify-between">
                                            <span>{exercise.exerciseName}</span>
                                            <span>{exercise.sets}x{exercise.reps} {exercise.weight}</span>
                                          </div>
                                        ))}
                                        {block.exercises.length > 2 && (
                                          <div className="text-xs text-gray-500">
                                            +{block.exercises.length - 2} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}