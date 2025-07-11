import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Activity, Trophy, Play, User, Dumbbell, TrendingUp, Target, Zap, Timer, Edit3, Calculator } from "lucide-react";
import WorkoutLogger from "@/components/workout/workout-logger";
import ProfileEditor from "@/components/profile/profile-editor";

export default function HealthPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("profile");
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [personalRecords, setPersonalRecords] = useState([
    { exercise: "Bench Press", weight: 225, percentages: {} },
    { exercise: "Squat", weight: 315, percentages: {} },
    { exercise: "Deadlift", weight: 405, percentages: {} },
    { exercise: "Overhead Press", weight: 135, percentages: {} },
  ]);
  const [bodyMetrics, setBodyMetrics] = useState({
    weight: 185,
    bodyFat: 12.5,
    muscleMass: 162,
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

  // Generate weeks with 6 days each
  const generateWeeks = () => {
    const totalWeeks = 4;
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      const week = {
        weekNumber: weekNum,
        phase: weekNum <= 2 ? "Load" : "Peak",
        phaseDescription: weekNum <= 2 ? "Building foundation" : "Maximum intensity",
        days: []
      };
      
      // Generate 6 days for each week
      for (let dayNum = 1; dayNum <= 6; dayNum++) {
        const dayNames = ["Upper Power", "Lower Power", "Push Focus", "Pull Focus", "Legs", "Full Body"];
        
        const day = {
          dayNumber: dayNum,
          name: dayNames[dayNum - 1],
          blocks: ["A", "B", "C"].map(blockLetter => ({
            blockLetter,
            name: `Block ${blockLetter}`,
            description: `Training block ${blockLetter}`
          }))
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
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Weight</div>
                      <div className="text-sm font-bold text-gray-900">{bodyMetrics.weight} lbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Body Fat</div>
                      <div className="text-sm font-bold text-gray-900">{bodyMetrics.bodyFat}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Muscle Mass</div>
                      <div className="text-sm font-bold text-gray-900">{bodyMetrics.muscleMass} lbs</div>
                    </div>
                  </div>
                </div>
              </>
            )}
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
                                <div className="px-3 pb-3 space-y-2 bg-gray-50">
                                  {day.blocks.map((block) => (
                                    <WorkoutLogger 
                                      key={block.blockLetter}
                                      weekNumber={week.weekNumber}
                                      dayNumber={day.dayNumber}
                                      blockLetter={block.blockLetter}
                                    />
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
                    
                    {/* Remove data points - just clean lines */}
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

            {/* This Week Focus - Donut Chart */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-400">
              <h4 className="text-xs font-medium text-gray-700 mb-3">This Week Focus</h4>
              
              {/* Donut Chart */}
              <div className="flex justify-center mb-3">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="24"
                    />
                    
                    {/* Strength segment (60%) */}
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="24"
                      strokeDasharray={`${60 * 3.01} ${100 * 3.01}`}
                      strokeDashoffset="0"
                      className="animate-drawCircle"
                    />
                    
                    {/* Cardio segment (25%) */}
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="24"
                      strokeDasharray={`${25 * 3.01} ${100 * 3.01}`}
                      strokeDashoffset={`${-60 * 3.01}`}
                      className="animate-drawCircle"
                      style={{ animationDelay: '200ms' }}
                    />
                    
                    {/* Functional segment (15%) */}
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="24"
                      strokeDasharray={`${15 * 3.01} ${100 * 3.01}`}
                      strokeDashoffset={`${-85 * 3.01}`}
                      className="animate-drawCircle"
                      style={{ animationDelay: '400ms' }}
                    />
                    
                    {/* Inner white circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="36"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Strength</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Cardio</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Functional</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">15%</span>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200 animate-fadeIn opacity-0 animation-delay-600">
              <h4 className="text-xs font-medium text-gray-700 mb-3">Progress Summary</h4>
              
              <div className="space-y-3">
                {/* Total Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Total Progress</span>
                    <span className="text-sm font-semibold text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      24%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full animate-slideInLeft"
                      style={{ width: '24%' }}
                    ></div>
                  </div>
                </div>
                
                {/* Current Phase */}
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-xs text-gray-600">Current Phase</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Peak
                  </span>
                </div>
                
                {/* Consistency */}
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-xs text-gray-600">Weekly Consistency</span>
                  <div className="flex items-center">
                    <div className="flex space-x-1 mr-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div
                          key={day}
                          className={`w-2 h-2 rounded-full ${
                            day <= 5 ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">5/7</span>
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