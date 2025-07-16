import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Activity, Trophy, Play, User, Dumbbell, TrendingUp, Target, Zap, Timer, Edit3, Calculator, Plus, ChevronLeft, ChevronRight, Calendar, Settings, BarChart2 } from "lucide-react";
import WorkoutLogger from "@/components/workout/workout-logger";
import ProfileEditor from "@/components/profile/profile-editor";
import ProgressAnalytics from "@/components/analytics/progress-analytics";

export default function HealthPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("profile");
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay());
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [personalRecords, setPersonalRecords] = useState([
    { exercise: "Bench Press", weight: 225, percentages: {} },
    { exercise: "Squat", weight: 315, percentages: {} },
    { exercise: "Deadlift", weight: 405, percentages: {} },
    { exercise: "Overhead Press", weight: 135, percentages: {} },
  ]);
  const [bodyMetrics, setBodyMetrics] = useState({
    weight: 185,
    bodyFat: 12.5,
  });
  const [showPercentages, setShowPercentages] = useState<{ [key: string]: boolean }>({});

  // Profile editing functions
  const handleProfileSave = (data: { personalRecords: any[]; bodyMetrics: any }) => {
    setPersonalRecords(data.personalRecords);
    setBodyMetrics(data.bodyMetrics);
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
  };

  const togglePercentages = (exercise: string) => {
    setShowPercentages(prev => ({
      ...prev,
      [exercise]: !prev[exercise],
    }));
  };

  const calculatePercentages = (maxWeight: number): { [key: string]: number } => {
    const percentages: { [key: string]: number } = {};
    for (let i = 60; i <= 90; i += 5) {
      percentages[`${i}%`] = Math.round((maxWeight * i) / 100);
    }
    return percentages;
  };

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

  // Navigation functions for user-friendly mode
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentDay < 6) {
        setCurrentDay(currentDay + 1);
      } else if (currentWeek < 4) {
        setCurrentWeek(currentWeek + 1);
        setCurrentDay(1);
      }
    } else {
      if (currentDay > 1) {
        setCurrentDay(currentDay - 1);
      } else if (currentWeek > 1) {
        setCurrentWeek(currentWeek - 1);
        setCurrentDay(6);
      }
    }
  };

  const getCurrentDayData = () => {
    const week = staticProgram.weeks.find(w => w.weekNumber === currentWeek);
    const day = week?.days.find(d => d.dayNumber === currentDay);
    return { week, day };
  };

  // Get workout for selected day of week
  const getWorkoutForDay = (dayOfWeek: number) => {
    // Map day of week (0=Sunday) to workout day (1-6, with Sunday as rest)
    const workoutDayMap: { [key: number]: number } = {
      0: 0, // Sunday - Rest
      1: 1, // Monday
      2: 2, // Tuesday  
      3: 3, // Wednesday
      4: 4, // Thursday
      5: 5, // Friday
      6: 6, // Saturday
    };
    
    const workoutDay = workoutDayMap[dayOfWeek];
    if (workoutDay === 0) return null; // Rest day
    
    // Find the week/day in the program
    const currentWeekData = staticProgram.weeks[Math.floor((workoutDay - 1) / 6)];
    const dayInWeek = ((workoutDay - 1) % 6) + 1;
    
    return currentWeekData?.days.find(d => d.dayNumber === dayInWeek);
  };

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate weeks with 6 days each
  const generateWeeks = () => {
    const totalWeeks = 4;
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      const week = {
        weekNumber: weekNum,
        phase: weekNum <= 2 ? "Load" : weekNum === 3 ? "Peak" : "Deload",
        phaseDescription: weekNum <= 2 ? "Building foundation" : weekNum === 3 ? "Maximum intensity" : "Active recovery",
        days: []
      };
      
      // Generate 6 days for each week
      for (let dayNum = 1; dayNum <= 6; dayNum++) {
        const dayNames = ["Upper Power", "Lower Power", "Push Focus", "Pull Focus", "Legs", "Full Body"];
        
        const day = {
          dayNumber: dayNum,
          name: dayNames[dayNum - 1],
          blocks: [
            {
              blockLetter: "A",
              name: "Primary Compound",
              description: "Main strength movement",
              exercises: [
                {
                  name: dayNum === 1 ? "Bench Press" : dayNum === 2 ? "Back Squat" : dayNum === 3 ? "Overhead Press" : dayNum === 4 ? "Deadlift" : dayNum === 5 ? "Front Squat" : "Clean & Jerk",
                  sets: weekNum <= 2 ? "4" : weekNum === 3 ? "5" : "3",
                  reps: weekNum <= 2 ? "5" : weekNum === 3 ? "3" : "5",
                  intensity: weekNum <= 2 ? "80-85%" : weekNum === 3 ? "85-90%" : "70-75%",
                  tempo: "31X1",
                  rest: "3-4 min",
                  notes: "Focus on explosive concentric"
                }
              ]
            },
            {
              blockLetter: "B",
              name: "Accessory Work",
              description: "Supporting movements",
              exercises: [
                {
                  name: dayNum === 1 ? "Incline DB Press" : dayNum === 2 ? "RDL" : dayNum === 3 ? "DB Shoulder Press" : dayNum === 4 ? "Pull-ups" : dayNum === 5 ? "Leg Press" : "Farmer's Walk",
                  sets: "4",
                  reps: "8-10",
                  intensity: "RPE 7-8",
                  rest: "2 min"
                },
                {
                  name: dayNum === 1 ? "Cable Flyes" : dayNum === 2 ? "Leg Curls" : dayNum === 3 ? "Lateral Raises" : dayNum === 4 ? "Barbell Rows" : dayNum === 5 ? "Walking Lunges" : "Sled Push",
                  sets: "3",
                  reps: "12-15",
                  intensity: "RPE 6-7",
                  rest: "90 sec"
                }
              ]
            },
            {
              blockLetter: "C",
              name: "Core & Conditioning",
              description: "Finisher circuit",
              exercises: [
                {
                  name: "Plank Variations",
                  sets: "3",
                  reps: "30-60 sec",
                  intensity: "Bodyweight",
                  rest: "30 sec"
                },
                {
                  name: dayNum % 2 === 0 ? "Bike Intervals" : "Row Intervals",
                  sets: "5",
                  reps: "30 sec on/30 sec off",
                  intensity: "High",
                  rest: "1 min between sets"
                }
              ]
            }
          ]
        };
        
        week.days.push(day);
      }
      
      weeks.push(week);
    }
    
    return weeks;
  };

  const staticProgram = {
    program: {
      name: "4-Week Elite Training Program",
      description: "Comprehensive strength and conditioning program designed for maximum results"
    },
    weeks: generateWeeks()
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
          <TabsList className="grid w-full grid-cols-3 h-10 bg-white shadow-md">
            <TabsTrigger value="profile" className="text-xs font-medium">
              <User className="h-3 w-3 mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="workout" className="text-xs font-medium">
              <Dumbbell className="h-3 w-3 mr-1" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="plan" className="text-xs font-medium">
              <Target className="h-3 w-3 mr-1" />
              Plan
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab Content */}
          <TabsContent value="profile" className="mt-3 space-y-2">
            {isEditingProfile ? (
              <ProfileEditor
                onSave={handleProfileSave}
                onCancel={handleProfileCancel}
                initialData={{
                  personalRecords,
                  bodyMetrics,
                }}
              />
            ) : (
              <>
                {/* Profile Header with Edit Button */}
                <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-blue-600" />
                      Personal Records (1RM)
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center space-x-1 text-xs"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {personalRecords.map((record) => (
                      <div key={record.exercise} className="space-y-2">
                        <div className="bg-gray-50 rounded p-2 border border-gray-200">
                          <div className="text-xs font-medium text-gray-700">{record.exercise}</div>
                          <div className="text-sm font-bold text-blue-600">{record.weight} lbs</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePercentages(record.exercise)}
                            className="text-xs p-0 h-auto mt-1 flex items-center space-x-1"
                          >
                            <Calculator className="h-3 w-3" />
                            <span>%</span>
                          </Button>
                        </div>
                        
                        {/* Percentage Display */}
                        {showPercentages[record.exercise] && (
                          <div className="bg-blue-50 rounded p-2 border border-blue-200">
                            <div className="text-xs font-medium text-blue-900 mb-1">Training %</div>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.entries(calculatePercentages(record.weight)).map(([percentage, weight]) => (
                                <div key={percentage} className="text-center text-xs">
                                  <div className="text-blue-600 font-medium">{percentage}</div>
                                  <div className="text-gray-900 font-bold">{weight} lbs</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Weight</div>
                      <div className="text-sm font-bold text-gray-900">{bodyMetrics.weight} lbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Body Fat</div>
                      <div className="text-sm font-bold text-gray-900">{bodyMetrics.bodyFat}%</div>
                    </div>
                  </div>
                </div>

                {/* Progress Analytics moved from Workout tab */}
                <ProgressAnalytics className="mt-4" />
              </>
            )}
          </TabsContent>

          {/* Workout Tab Content */}
          <TabsContent value="workout" className="mt-3 space-y-2">
            {/* Weekday Track */}
            <div className="bg-white rounded-lg shadow-md p-2 border border-blue-200">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, index) => {
                  const isToday = index === new Date().getDay();
                  const isSelected = index === selectedDayOfWeek;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayOfWeek(index)}
                      className={`
                        py-2 px-1 rounded text-center transition-all
                        ${isSelected ? 'bg-blue-600 text-white' : 
                          isToday ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      <div className="text-xs font-medium">{day}</div>
                      <div className="text-lg font-bold">
                        {new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + index)).getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workout Timer */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Timer className="h-4 w-4 mr-2 text-blue-600" />
                  Workout Timer
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatTime(workoutTimer)}
                  </span>
                  <Button
                    size="sm"
                    onClick={isTimerRunning ? stopWorkout : startWorkout}
                    className="text-xs h-7"
                  >
                    {isTimerRunning ? 'Stop' : 'Start'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Workout Blocks */}
            <div className="space-y-2">
              {(() => {
                const dayWorkout = getWorkoutForDay(selectedDayOfWeek);
                
                if (!dayWorkout) {
                  return (
                    <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">Rest Day</p>
                      <p className="text-xs text-gray-500 mt-1">Recovery is part of the process</p>
                    </div>
                  );
                }

                return dayWorkout.blocks.map((block) => {
                  const blockId = `${selectedDayOfWeek}-${block.blockLetter}`;
                  const isExpanded = expandedBlocks.has(blockId);
                  
                  return (
                    <div key={blockId} className="bg-white rounded-lg shadow-md border border-blue-200">
                      <button
                        onClick={() => toggleBlock(blockId)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-blue-50 transition-colors rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-700 font-bold rounded px-2 py-1 text-sm">
                            Block {block.blockLetter}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {block.exercises[0]?.name || 'Workout Block'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {block.exercises.length} exercise{block.exercises.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-200">
                          {block.exercises.map((exercise, idx) => (
                            <div key={idx} className="py-3 border-b border-gray-100 last:border-0">
                              <h5 className="font-semibold text-sm text-gray-900 mb-2">
                                {exercise.name}
                              </h5>
                              <div className="space-y-1 text-xs text-gray-700">
                                <div>{exercise.sets} Sets</div>
                                <div>{exercise.reps} @ {exercise.intensity}</div>
                                {exercise.tempo && <div>Tempo: {exercise.tempo}</div>}
                                {exercise.rest && <div>Rest: {exercise.rest}</div>}
                                {exercise.notes && (
                                  <div className="text-gray-600 italic mt-1">{exercise.notes}</div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                // TODO: Implement workout logging
                                console.log('Log workout for block', blockId);
                              }}
                            >
                              Log Your Result
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </TabsContent>

          {/* Plan Tab Content */}
          <TabsContent value="plan" className="mt-3 space-y-2">
            {/* Plan Builder Header */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-600" />
                  Training Plan Builder
                </h3>
                <Button size="sm" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  New Plan
                </Button>
              </div>
              <p className="text-xs text-gray-600">Design custom workout programs and launch them to your workout page</p>
            </div>

            {/* Current Plans */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-600" />
                My Training Plans
              </h4>
              
              {/* Active Plan */}
              <div className="border border-green-200 rounded-lg p-2 bg-green-50 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-green-800">4-Week Elite Program</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">ACTIVE</span>
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      Edit
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-green-700 mb-1">Comprehensive strength and conditioning program</p>
                <div className="text-xs text-green-600">
                  Week 2 of 4 • 6 days/week • Currently running on Workout page
                </div>
              </div>

              {/* Draft Plans */}
              <div className="space-y-1">
                <div className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Summer Cut Program</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">DRAFT</span>
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        Launch
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">6-week fat loss and muscle definition plan</p>
                  <div className="text-xs text-gray-500">
                    6 weeks • 5 days/week • Ready to launch
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Powerlifting Prep</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">BUILDING</span>
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        Continue
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">12-week competition preparation program</p>
                  <div className="text-xs text-gray-500">
                    In progress • 4 of 12 weeks designed
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Templates */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Plan Templates
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-blue-200 rounded-lg p-2 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div className="text-sm font-medium text-blue-900 mb-1">Strength Builder</div>
                  <div className="text-xs text-blue-700">8-week progressive overload</div>
                </div>
                
                <div className="border border-green-200 rounded-lg p-2 hover:bg-green-50 cursor-pointer transition-colors">
                  <div className="text-sm font-medium text-green-900 mb-1">Fat Loss</div>
                  <div className="text-xs text-green-700">6-week metabolic focus</div>
                </div>
                
                <div className="border border-purple-200 rounded-lg p-2 hover:bg-purple-50 cursor-pointer transition-colors">
                  <div className="text-sm font-medium text-purple-900 mb-1">Athlete Prep</div>
                  <div className="text-xs text-purple-700">Sport-specific training</div>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-2 hover:bg-orange-50 cursor-pointer transition-colors">
                  <div className="text-sm font-medium text-orange-900 mb-1">Beginner</div>
                  <div className="text-xs text-orange-700">12-week foundation</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}