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
  const [isBuilding, setIsBuilding] = useState(false);
  const [calculatedPercentages, setCalculatedPercentages] = useState<{ [key: string]: number }>({});
  const [buildingPlan, setBuildingPlan] = useState({
    name: '',
    description: '',
    weeks: []
  });
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

  // Plan Builder Functions
  const addWeek = () => {
    setBuildingPlan({
      ...buildingPlan,
      weeks: [
        ...buildingPlan.weeks,
        {
          weekNumber: buildingPlan.weeks.length + 1,
          phase: '',
          days: []
        }
      ]
    });
  };

  const removeWeek = (weekIndex: number) => {
    setBuildingPlan({
      ...buildingPlan,
      weeks: buildingPlan.weeks.filter((_, i) => i !== weekIndex)
    });
  };

  const updateWeekPhase = (weekIndex: number, phase: string) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].phase = phase;
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const addDay = (weekIndex: number) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days.push({
      dayNumber: newWeeks[weekIndex].days.length + 1,
      name: '',
      blocks: []
    });
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const removeDay = (weekIndex: number, dayIndex: number) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days = newWeeks[weekIndex].days.filter((_, i) => i !== dayIndex);
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const updateDayName = (weekIndex: number, dayIndex: number, name: string) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days[dayIndex].name = name;
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const addBlock = (weekIndex: number, dayIndex: number) => {
    const newWeeks = [...buildingPlan.weeks];
    const blockLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLetter = blockLetters[newWeeks[weekIndex].days[dayIndex].blocks.length];
    
    newWeeks[weekIndex].days[dayIndex].blocks.push({
      blockLetter: nextLetter || 'X',
      name: '',
      exercises: []
    });
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const updateBlockName = (weekIndex: number, dayIndex: number, blockIndex: number, name: string) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days[dayIndex].blocks[blockIndex].name = name;
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const addExercise = (weekIndex: number, dayIndex: number, blockIndex: number) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.push({
      name: '',
      sets: '',
      reps: '',
      intensity: '',
      rest: ''
    });
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const removeExercise = (weekIndex: number, dayIndex: number, blockIndex: number, exerciseIndex: number) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises = 
      newWeeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const updateExercise = (weekIndex: number, dayIndex: number, blockIndex: number, exerciseIndex: number, field: string, value: string) => {
    const newWeeks = [...buildingPlan.weeks];
    newWeeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex][field] = value;
    setBuildingPlan({ ...buildingPlan, weeks: newWeeks });
  };

  const savePlan = () => {
    // TODO: Save plan to database
    console.log('Saving plan:', buildingPlan);
    setIsBuilding(false);
    setBuildingPlan({ name: '', description: '', weeks: [] });
  };

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
                <Button 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setIsBuilding(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Build Plan
                </Button>
              </div>
              <p className="text-xs text-gray-600">Create custom workout programs from scratch</p>
            </div>

            {/* Plan Builder Interface */}
            {isBuilding ? (
              <div className="space-y-2">
                {/* Plan Name */}
                <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
                  <input
                    type="text"
                    placeholder="Plan Name"
                    className="w-full text-sm font-semibold bg-transparent border-b border-gray-300 pb-1 mb-2 focus:outline-none focus:border-blue-500"
                    value={buildingPlan.name}
                    onChange={(e) => setBuildingPlan({...buildingPlan, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Plan Description"
                    className="w-full text-xs bg-transparent border-b border-gray-300 pb-1 focus:outline-none focus:border-blue-500"
                    value={buildingPlan.description}
                    onChange={(e) => setBuildingPlan({...buildingPlan, description: e.target.value})}
                  />
                </div>

                {/* Week Builder */}
                <div className="space-y-2">
                  {buildingPlan.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="bg-white rounded-lg shadow-md border border-blue-200">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">Week {weekIndex + 1}</span>
                            <input
                              type="text"
                              placeholder="Phase name"
                              className="text-xs bg-gray-100 rounded px-2 py-1 w-24"
                              value={week.phase}
                              onChange={(e) => updateWeekPhase(weekIndex, e.target.value)}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                            onClick={() => removeWeek(weekIndex)}
                          >
                            Remove
                          </Button>
                        </div>

                        {/* Days in Week */}
                        <div className="space-y-1">
                          {week.days.map((day, dayIndex) => (
                            <div key={dayIndex} className="border border-gray-200 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <input
                                  type="text"
                                  placeholder={`Day ${dayIndex + 1} Name`}
                                  className="text-xs font-medium bg-transparent w-32"
                                  value={day.name}
                                  onChange={(e) => updateDayName(weekIndex, dayIndex, e.target.value)}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-5 px-1"
                                  onClick={() => removeDay(weekIndex, dayIndex)}
                                >
                                  ×
                                </Button>
                              </div>

                              {/* Blocks in Day */}
                              <div className="space-y-1 mt-2">
                                {day.blocks.map((block, blockIndex) => (
                                  <div key={blockIndex} className="bg-gray-50 rounded p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                          Block {block.blockLetter}
                                        </span>
                                        <input
                                          type="text"
                                          placeholder="Block name"
                                          className="text-xs bg-transparent w-24"
                                          value={block.name}
                                          onChange={(e) => updateBlockName(weekIndex, dayIndex, blockIndex, e.target.value)}
                                        />
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs h-5 px-1"
                                        onClick={() => addExercise(weekIndex, dayIndex, blockIndex)}
                                      >
                                        + Exercise
                                      </Button>
                                    </div>

                                    {/* Exercises in Block */}
                                    {block.exercises.map((exercise, exerciseIndex) => (
                                      <div key={exerciseIndex} className="bg-white rounded p-1.5 mt-1 text-xs">
                                        <div className="grid grid-cols-12 gap-1 items-center">
                                          <input
                                            type="text"
                                            placeholder="Exercise"
                                            className="col-span-4 bg-gray-100 rounded px-1 py-0.5"
                                            value={exercise.name}
                                            onChange={(e) => updateExercise(weekIndex, dayIndex, blockIndex, exerciseIndex, 'name', e.target.value)}
                                          />
                                          <input
                                            type="text"
                                            placeholder="Sets"
                                            className="col-span-1 bg-gray-100 rounded px-1 py-0.5 text-center"
                                            value={exercise.sets}
                                            onChange={(e) => updateExercise(weekIndex, dayIndex, blockIndex, exerciseIndex, 'sets', e.target.value)}
                                          />
                                          <input
                                            type="text"
                                            placeholder="Reps"
                                            className="col-span-2 bg-gray-100 rounded px-1 py-0.5 text-center"
                                            value={exercise.reps}
                                            onChange={(e) => updateExercise(weekIndex, dayIndex, blockIndex, exerciseIndex, 'reps', e.target.value)}
                                          />
                                          <input
                                            type="text"
                                            placeholder="%/RPE"
                                            className="col-span-2 bg-gray-100 rounded px-1 py-0.5 text-center"
                                            value={exercise.intensity}
                                            onChange={(e) => updateExercise(weekIndex, dayIndex, blockIndex, exerciseIndex, 'intensity', e.target.value)}
                                          />
                                          <input
                                            type="text"
                                            placeholder="Rest"
                                            className="col-span-2 bg-gray-100 rounded px-1 py-0.5 text-center"
                                            value={exercise.rest}
                                            onChange={(e) => updateExercise(weekIndex, dayIndex, blockIndex, exerciseIndex, 'rest', e.target.value)}
                                          />
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="col-span-1 text-xs h-5 px-1"
                                            onClick={() => removeExercise(weekIndex, dayIndex, blockIndex, exerciseIndex)}
                                          >
                                            ×
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs h-6 mt-1"
                                  onClick={() => addBlock(weekIndex, dayIndex)}
                                >
                                  + Add Block
                                </Button>
                              </div>
                            </div>
                          ))}

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs h-7"
                            onClick={() => addDay(weekIndex)}
                          >
                            + Add Day
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={addWeek}
                  >
                    + Add Week
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setIsBuilding(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                    onClick={savePlan}
                  >
                    Save Plan
                  </Button>
                </div>
              </div>
            ) : (
              /* Saved Plans List */
              <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">My Plans</h4>
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No plans created yet</p>
                  <p className="text-xs mt-1">Click "Build Plan" to create your first workout program</p>
                </div>
              </div>
            )}

            {/* Percentage Calculator Tool */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                1RM Percentage Calculator
              </h4>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Max Weight"
                  className="flex-1 text-sm bg-gray-100 rounded px-2 py-1"
                  onChange={(e) => {
                    const max = parseInt(e.target.value);
                    if (!isNaN(max)) {
                      setCalculatedPercentages({
                        '60%': Math.round(max * 0.6),
                        '65%': Math.round(max * 0.65),
                        '70%': Math.round(max * 0.7),
                        '75%': Math.round(max * 0.75),
                        '80%': Math.round(max * 0.8),
                        '85%': Math.round(max * 0.85),
                        '90%': Math.round(max * 0.9),
                      });
                    }
                  }}
                />
              </div>
              {Object.keys(calculatedPercentages).length > 0 && (
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {Object.entries(calculatedPercentages).map(([percent, weight]) => (
                    <div key={percent} className="text-center bg-gray-100 rounded p-1">
                      <div className="text-xs text-gray-600">{percent}</div>
                      <div className="text-xs font-bold">{weight}lbs</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}