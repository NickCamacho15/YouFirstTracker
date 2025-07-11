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

            {/* Volume Progress Over Time */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700">Weekly Volume Progress</h4>
                <span className="text-xs text-gray-500">Last 8 weeks</span>
              </div>
              
              {/* Line Graph */}
              <div className="h-32 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
                  <span>50k</span>
                  <span>40k</span>
                  <span>30k</span>
                  <span>20k</span>
                  <span>10k</span>
                  <span>0</span>
                </div>
                
                {/* Graph area */}
                <div className="ml-10 h-full relative">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="100%" y2="0" stroke="#E5E7EB" strokeWidth="1" />
                    <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#E5E7EB" strokeWidth="1" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#E5E7EB" strokeWidth="1" />
                    <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#E5E7EB" strokeWidth="1" />
                    <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#E5E7EB" strokeWidth="1" />
                    
                    {/* Progress line with gradient */}
                    <defs>
                      <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                    
                    <polyline 
                      points="0,90 14.3,80 28.6,75 42.9,65 57.1,50 71.4,40 85.7,35 100,20"
                      fill="none" 
                      stroke="url(#volumeGradient)" 
                      strokeWidth="3"
                      className="animate-drawLine"
                    />
                    
                    {/* Data points */}
                    {[
                      { x: 0, y: 90, value: "22k", pct: "44%" },
                      { x: 14.3, y: 80, value: "26k", pct: "52%" },
                      { x: 28.6, y: 75, value: "28k", pct: "56%" },
                      { x: 42.9, y: 65, value: "32k", pct: "64%" },
                      { x: 57.1, y: 50, value: "38k", pct: "76%" },
                      { x: 71.4, y: 40, value: "42k", pct: "84%" },
                      { x: 85.7, y: 35, value: "44k", pct: "88%" },
                      { x: 100, y: 20, value: "48k", pct: "96%" }
                    ].map((point, idx) => (
                      <g key={idx} className="animate-fadeIn opacity-0" style={{ animationDelay: `${400 + idx * 100}ms` }}>
                        <circle cx={`${point.x}%`} cy={`${point.y}%`} r="4" fill="#2563EB" />
                        <circle cx={`${point.x}%`} cy={`${point.y}%`} r="6" fill="#2563EB" opacity="0.3" />
                        <text 
                          x={`${point.x}%`} 
                          y={`${point.y - 8}%`} 
                          className="text-[10px] font-medium" 
                          fill={idx === 7 ? "#059669" : "#6B7280"}
                          textAnchor="middle"
                        >
                          {point.pct}
                        </text>
                      </g>
                    ))}
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>W1</span>
                    <span>W2</span>
                    <span>W3</span>
                    <span>W4</span>
                    <span>W5</span>
                    <span>W6</span>
                    <span>W7</span>
                    <span>W8</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600">
                Your volume has increased by <span className="text-green-600 font-medium">118%</span> over 8 weeks
              </div>
            </div>

            {/* Strength Progress */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-400">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700">Strength Progress (1RM)</h4>
                <span className="text-xs text-gray-500">Last 12 weeks</span>
              </div>
              
              {/* Bar Chart */}
              <div className="h-24 flex items-end justify-between space-x-1">
                {[
                  { week: "W1", value: 58, color: "bg-blue-300" },
                  { week: "W2", value: 62, color: "bg-blue-300" },
                  { week: "W3", value: 64, color: "bg-blue-300" },
                  { week: "W4", value: 68, color: "bg-blue-400" },
                  { week: "W5", value: 70, color: "bg-blue-400" },
                  { week: "W6", value: 75, color: "bg-blue-400" },
                  { week: "W7", value: 78, color: "bg-blue-500" },
                  { week: "W8", value: 82, color: "bg-blue-500" },
                  { week: "W9", value: 85, color: "bg-blue-500" },
                  { week: "W10", value: 87, color: "bg-blue-600" },
                  { week: "W11", value: 90, color: "bg-blue-600" },
                  { week: "W12", value: 96, color: "bg-blue-700" }
                ].map((data, idx) => (
                  <div key={data.week} className="flex-1 flex flex-col items-center justify-end">
                    <span 
                      className="text-[10px] text-gray-700 font-medium mb-1 animate-fadeIn opacity-0" 
                      style={{ animationDelay: `${600 + idx * 50}ms` }}
                    >
                      {data.value}%
                    </span>
                    <div 
                      className={`w-full ${data.color} rounded-t relative animate-growUp`} 
                      style={{ 
                        height: `${data.value}%`,
                        animationDelay: `${600 + idx * 50}ms` 
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-1">
                {Array.from({length: 12}, (_, i) => (
                  <span key={i} className="text-[9px] text-gray-500 flex-1 text-center">
                    {i % 3 === 0 ? `W${i + 1}` : ''}
                  </span>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-gray-600">
                Bench Press 1RM increased from <span className="text-blue-500 font-medium">285 lbs</span> to <span className="text-blue-700 font-medium">315 lbs</span>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-600">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Performance Trends</h4>
              <div className="space-y-3">
                {/* Intensity Trend */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Avg. Intensity</span>
                    <span className="font-medium text-green-600">82% (+5%)</span>
                  </div>
                  <div className="h-8 flex items-end space-x-0.5">
                    {[65, 68, 70, 72, 74, 76, 78, 82].map((val, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 bg-blue-400 rounded-t animate-growUp" 
                        style={{ 
                          height: `${val}%`,
                          animationDelay: `${800 + idx * 50}ms` 
                        }} 
                      />
                    ))}
                  </div>
                </div>
                
                {/* Recovery Trend */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Recovery Score</span>
                    <span className="font-medium text-green-600">8.5/10</span>
                  </div>
                  <div className="h-8 flex items-end space-x-0.5">
                    {[60, 65, 70, 75, 78, 80, 83, 85].map((val, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 bg-green-400 rounded-t animate-growUp" 
                        style={{ 
                          height: `${val}%`,
                          animationDelay: `${1200 + idx * 50}ms` 
                        }} 
                      />
                    ))}
                  </div>
                </div>
                
                {/* Consistency */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Workout Consistency</span>
                    <span className="font-medium text-blue-600">92%</span>
                  </div>
                  <div className="h-8 flex items-end space-x-0.5">
                    {[85, 88, 86, 90, 92, 94, 91, 92].map((val, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 bg-purple-400 rounded-t animate-growUp" 
                        style={{ 
                          height: `${val}%`,
                          animationDelay: `${1600 + idx * 50}ms` 
                        }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Distribution & Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-800">
                <h4 className="text-xs font-medium text-gray-700 mb-2">This Week Focus</h4>
                <div className="space-y-1">
                  {[
                    { category: "Strength", percentage: 60, color: "bg-blue-500" },
                    { category: "Cardio", percentage: 25, color: "bg-green-500" },
                    { category: "Functional", percentage: 15, color: "bg-orange-500" }
                  ].map((cat, idx) => (
                    <div key={cat.category} className="flex items-center space-x-2 animate-slideInLeft opacity-0" style={{ animationDelay: `${1000 + idx * 100}ms` }}>
                      <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span className="text-xs text-gray-600 flex-1">{cat.category}</span>
                      <span className="text-xs font-medium">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-800">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Progress Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs animate-slideInRight opacity-0" style={{ animationDelay: '1000ms' }}>
                    <span className="text-gray-600">Total Progress</span>
                    <span className="font-medium text-green-600">↑ 24%</span>
                  </div>
                  <div className="flex justify-between text-xs animate-slideInRight opacity-0" style={{ animationDelay: '1100ms' }}>
                    <span className="text-gray-600">Current Phase</span>
                    <span className="font-medium text-blue-600">Peak</span>
                  </div>
                  <div className="flex justify-between text-xs animate-slideInRight opacity-0" style={{ animationDelay: '1200ms' }}>
                    <span className="text-gray-600">Next Goal</span>
                    <span className="font-medium text-blue-600">500lb DL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}