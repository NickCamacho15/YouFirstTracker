import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Activity, Trophy, Play, User, Dumbbell, TrendingUp, Target, Zap, Timer } from "lucide-react";

export default function HealthPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("workout");
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setIsTimerRunning(true);
    setWorkoutTimer(0);
  };

  const stopWorkout = () => {
    setIsTimerRunning(false);
  };

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
            {isTimerRunning ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded">
                  <Timer className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-mono text-red-600">{formatTime(workoutTimer)}</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs shadow-md"
                  onClick={stopWorkout}
                >
                  Stop
                </Button>
              </div>
            ) : (
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs shadow-md"
                onClick={startWorkout}
              >
                <Play className="h-3 w-3 mr-1" />
                Start Workout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-2 pt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-10 bg-white shadow-md">
            <TabsTrigger value="profile" className="text-xs font-medium">
              <User className="h-3 w-3 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="workout" className="text-xs font-medium">
              <Dumbbell className="h-3 w-3 mr-1" />
              Workout
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab Content */}
          <TabsContent value="profile" className="mt-3 space-y-2">
            {/* 1RM Section */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-blue-600" />
                Personal Records (1RM)
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { exercise: "Bench Press", weight: "315 lbs", date: "Jan 5" },
                  { exercise: "Squat", weight: "405 lbs", date: "Jan 2" },
                  { exercise: "Deadlift", weight: "455 lbs", date: "Dec 28" },
                  { exercise: "Overhead Press", weight: "185 lbs", date: "Jan 8" }
                ].map((pr) => (
                  <div key={pr.exercise} className="bg-gray-50 rounded p-2 border border-gray-200">
                    <div className="text-xs font-medium text-gray-700">{pr.exercise}</div>
                    <div className="text-sm font-bold text-blue-600">{pr.weight}</div>
                    <div className="text-xs text-gray-500">{pr.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Stats */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Training Stats
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Total Workouts</span>
                  <span className="text-sm font-medium text-gray-900">247</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Avg. Workout Duration</span>
                  <span className="text-sm font-medium text-gray-900">52 mins</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Current Streak</span>
                  <span className="text-sm font-medium text-green-600">12 days</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-600">Total Volume This Week</span>
                  <span className="text-sm font-medium text-gray-900">42,350 lbs</span>
                </div>
              </div>
            </div>

            {/* Body Metrics */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-600" />
                Body Metrics
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Weight</div>
                  <div className="text-sm font-bold text-gray-900">185 lbs</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Body Fat</div>
                  <div className="text-sm font-bold text-gray-900">12.5%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Muscle Mass</div>
                  <div className="text-sm font-bold text-gray-900">162 lbs</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Workout Tab Content */}
          <TabsContent value="workout" className="mt-3 space-y-2">
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

          {/* Analytics Section */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 px-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
              Progress Analytics
            </h3>

            {/* Weekly Volume Chart */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Weekly Volume (lbs)</h4>
              <div className="h-24 flex items-end justify-between space-x-1">
                {[
                  { week: "W1", volume: 38000 },
                  { week: "W2", volume: 42000 },
                  { week: "W3", volume: 45000 },
                  { week: "W4", volume: 32000 }
                ].map((data) => {
                  const height = (data.volume / 45000) * 100;
                  return (
                    <div key={data.week} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-200 rounded-t relative" style={{ height: `${height}%` }}>
                        <span className="absolute -top-5 left-0 right-0 text-center text-xs font-medium text-gray-700">
                          {(data.volume / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{data.week}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exercise Distribution */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Exercise Distribution</h4>
              <div className="space-y-2">
                {[
                  { category: "Strength", percentage: 60, color: "bg-blue-500" },
                  { category: "Cardio", percentage: 25, color: "bg-green-500" },
                  { category: "Functional", percentage: 15, color: "bg-orange-500" }
                ].map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{cat.category}</span>
                      <span className="font-medium">{cat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
                <div className="text-xs text-gray-600">Avg. Intensity</div>
                <div className="text-lg font-bold text-blue-600">82%</div>
                <div className="text-xs text-green-600">↑ 5% from last week</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
                <div className="text-xs text-gray-600">Recovery Score</div>
                <div className="text-lg font-bold text-green-600">8.5/10</div>
                <div className="text-xs text-gray-600">Ready to train</div>
              </div>
            </div>
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}