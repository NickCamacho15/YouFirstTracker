import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Activity, Trophy, Play, User, Dumbbell, TrendingUp, Target, Zap, Timer, Edit3, Calculator } from "lucide-react";
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
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Dumbbell className="h-4 w-4 mr-2 text-blue-600" />
                Workout Logger
              </h3>
              <p className="text-xs text-gray-600 mb-3">Log your workouts and track your progress in real-time</p>
              
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2" />
                </div>
                <p className="text-sm text-gray-600">Workout logging interface coming soon</p>
                <p className="text-xs text-gray-500 mt-1">Log exercises, sets, reps, and weights</p>
              </div>
            </div>
          </TabsContent>

          {/* Plan Tab Content */}
          <TabsContent value="plan" className="mt-3 space-y-2">
            <div className="bg-white rounded-lg shadow-md p-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Training Plans
              </h3>
              <p className="text-xs text-gray-600 mb-3">Create and manage your personalized training plans</p>
              
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                </div>
                <p className="text-sm text-gray-600">Plan creation interface coming soon</p>
                <p className="text-xs text-gray-500 mt-1">Design custom workout programs and schedules</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}