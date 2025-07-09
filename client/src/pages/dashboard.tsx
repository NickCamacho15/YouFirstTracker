import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { NewHabitModal } from "@/components/habits/new-habit-modal";
import { HabitStoryBar } from "@/components/habits/habit-story-bar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Target, 
  Repeat, 
  BookOpen, 
  ImageIcon, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Trophy,
  Star,
  ChevronUp,
  ChevronDown,
  Coffee,
  Moon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  
  // Critical tasks completion counter - tracks lifetime achievements
  const [criticalTasksCompleted, setCriticalTasksCompleted] = useState(147);
  
  // Goals with cumulative task completion tracking
  const [goals] = useState([
    { id: 1, title: 'Q4 Business Review', description: 'Complete quarterly business analysis', tasksCompleted: 234, daysWorking: 45, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { id: 2, title: 'Team Leadership', description: 'Develop team processes and culture', tasksCompleted: 187, daysWorking: 62, color: 'bg-gradient-to-r from-purple-500 to-pink-600' },
    { id: 3, title: 'Personal Development', description: 'Health and wellness improvements', tasksCompleted: 456, daysWorking: 89, color: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
    { id: 4, title: 'Home Organization', description: 'Organize and optimize living space', tasksCompleted: 98, daysWorking: 23, color: 'bg-gradient-to-r from-orange-500 to-red-600' }
  ]);

  // Get current day and week
  const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState(currentDay === 0 ? 1 : currentDay); // Default to Monday if Sunday

  // Weekly tasks organized by day
  const [weeklyTasks, setWeeklyTasks] = useState({
    1: [ // Monday
      { id: 'mon-1', text: 'Team standup meeting', completed: false, goalId: 2, time: '9 AM', priority: 1 },
      { id: 'mon-2', text: 'Review quarterly metrics', completed: false, goalId: 1, time: 'Due 2 PM', priority: 2 },
      { id: 'mon-3', text: 'Plan weekly priorities', completed: false, goalId: 1, priority: 3 }
    ],
    2: [ // Tuesday
      { id: 'tue-1', text: 'Client presentation prep', completed: false, goalId: 1, time: '10 AM', priority: 1 },
      { id: 'tue-2', text: 'Fitness training session', completed: false, goalId: 3, time: '6 PM', priority: 2 },
      { id: 'tue-3', text: 'Team 1:1 meetings', completed: false, goalId: 2, priority: 3 }
    ],
    3: [ // Wednesday
      { id: 'wed-1', text: 'Mid-week project review', completed: false, goalId: 1, time: '2 PM', priority: 1 },
      { id: 'wed-2', text: 'Meal prep for week', completed: false, goalId: 3, priority: 2 },
      { id: 'wed-3', text: 'Update project timeline', completed: false, goalId: 2, priority: 3 }
    ],
    4: [ // Thursday
      { id: 'thu-1', text: 'Prepare presentation slides', completed: false, goalId: 1, time: '11 AM', priority: 1 },
      { id: 'thu-2', text: 'Doctor appointment', completed: false, goalId: 3, time: '3 PM', priority: 2 },
      { id: 'thu-3', text: 'Team retrospective', completed: false, goalId: 2, priority: 3 }
    ],
    5: [ // Friday
      { id: 'fri-1', text: 'Week wrap-up meeting', completed: false, goalId: 2, time: '4 PM', priority: 1 },
      { id: 'fri-2', text: 'Complete weekly reports', completed: false, goalId: 1, priority: 2 },
      { id: 'fri-3', text: 'Plan weekend activities', completed: false, goalId: 3, priority: 3 }
    ],
    6: [ // Saturday
      { id: 'sat-1', text: 'Home organization project', completed: false, goalId: 4, time: '10 AM', priority: 1 },
      { id: 'sat-2', text: 'Family time activities', completed: false, goalId: 3, priority: 2 },
      { id: 'sat-3', text: 'Personal development reading', completed: false, goalId: 3, priority: 3 }
    ],
    0: [ // Sunday
      { id: 'sun-1', text: 'Weekly reflection & planning', completed: false, goalId: 1, time: '6 PM', priority: 1 },
      { id: 'sun-2', text: 'Prepare for upcoming week', completed: false, goalId: 2, priority: 2 },
      { id: 'sun-3', text: 'Rest and recharge', completed: false, goalId: 3, priority: 3 }
    ]
  });

  // Auto refresh on Sunday
  useEffect(() => {
    const checkSundayRefresh = () => {
      const now = new Date();
      const day = now.getDay();
      
      // If it's Sunday and past 6 PM, reset the week
      if (day === 0 && now.getHours() >= 18) {
        // Reset all tasks to uncompleted for the new week
        setWeeklyTasks(prev => {
          const resetTasks = { ...prev };
          Object.keys(resetTasks).forEach(dayKey => {
            resetTasks[dayKey] = resetTasks[dayKey].map(task => ({ ...task, completed: false }));
          });
          return resetTasks;
        });
      }
    };

    // Check every hour
    const interval = setInterval(checkSundayRefresh, 60 * 60 * 1000);
    checkSundayRefresh(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  const currentDayTasks = weeklyTasks[selectedDay] || [];

  // Morning routines with streak tracking
  const [morningRoutines, setMorningRoutines] = useState([
    { id: 'morning-1', text: 'Meditation (10 min)', completed: true, priority: 1, streak: 12, weeklyTarget: 7 },
    { id: 'morning-2', text: 'Exercise', completed: false, priority: 2, streak: 8, weeklyTarget: 5 },
    { id: 'morning-3', text: 'Healthy breakfast', completed: false, priority: 3, streak: 15, weeklyTarget: 7 },
    { id: 'morning-4', text: 'Review daily priorities', completed: false, priority: 4, streak: 6, weeklyTarget: 7 }
  ]);

  // Evening routines with streak tracking
  const [eveningRoutines, setEveningRoutines] = useState([
    { id: 'evening-1', text: 'Daily reflection', completed: false, priority: 1, streak: 9, weeklyTarget: 7 },
    { id: 'evening-2', text: 'Reading (30 min)', completed: false, priority: 2, streak: 11, weeklyTarget: 5 },
    { id: 'evening-3', text: 'Prepare tomorrow', completed: false, priority: 3, streak: 4, weeklyTarget: 7 },
    { id: 'evening-4', text: 'Gratitude practice', completed: false, priority: 4, streak: 14, weeklyTarget: 7 }
  ]);

  // Calculate routine completion percentages
  const morningCompletionRate = Math.round((morningRoutines.filter(r => r.completed).length / morningRoutines.length) * 100);
  const eveningCompletionRate = Math.round((eveningRoutines.filter(r => r.completed).length / eveningRoutines.length) * 100);
  const routineOverallRate = Math.round(((morningRoutines.filter(r => r.completed).length + eveningRoutines.filter(r => r.completed).length) / (morningRoutines.length + eveningRoutines.length)) * 100);

  const handleWeeklyTaskToggle = (taskId: string) => {
    setWeeklyTasks(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay as keyof typeof prev].map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, completed: !task.completed };
          
          if (updatedTask.completed && !task.completed) {
            setCriticalTasksCompleted(count => count + 1);
          } else if (!updatedTask.completed && task.completed) {
            setCriticalTasksCompleted(count => Math.max(0, count - 1));
          }
          
          return updatedTask;
        }
        return task;
      })
    }));
  };

  const handleMorningRoutineToggle = (taskId: string) => {
    setMorningRoutines(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleEveningRoutineToggle = (taskId: string) => {
    setEveningRoutines(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getGoalById = (goalId: number) => goals.find(g => g.id === goalId);

  return (
    <div className="min-h-screen bg-white">
      <main className="p-4 pb-24">
        {/* Mobile Day Selector - Only visible on mobile */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(selectedDay === 1 ? 0 : selectedDay - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{dayNames[selectedDay]}</div>
              <div className="text-xs text-gray-500">Today's Focus</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(selectedDay === 0 ? 1 : (selectedDay + 1) % 7)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Circles Overview - Four Across */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {/* Habits Progress */}
          <div className="text-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${75}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">75%</span>
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Habits</h3>
            <p className="text-xs text-gray-500">Daily</p>
          </div>

          {/* Tasks Progress */}
          <div className="text-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${Math.round((currentDayTasks.filter(t => t.completed).length / Math.max(currentDayTasks.length, 1)) * 100)}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">{Math.round((currentDayTasks.filter(t => t.completed).length / Math.max(currentDayTasks.length, 1)) * 100)}%</span>
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Tasks</h3>
            <p className="text-xs text-gray-500">Today</p>
          </div>

          {/* Routines Progress */}
          <div className="text-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray={`${routineOverallRate}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">{routineOverallRate}%</span>
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Routines</h3>
            <p className="text-xs text-gray-500">Daily</p>
          </div>

          {/* Goals Progress */}
          <div className="text-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeDasharray={`${65}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">65%</span>
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Goals</h3>
            <p className="text-xs text-gray-500">Weekly</p>
          </div>
        </div>

        {/* Goals Grid with Task Counters */}
        <Card className="border-0 shadow-lg mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              Active Goals
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Track task completion progress for each goal
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {goals.map((goal) => {
                return (
                  <div key={goal.id} className={`${goal.color} p-4 sm:p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 truncate">{goal.title}</h3>
                        <p className="text-white/90 text-xs sm:text-sm line-clamp-2">{goal.description}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-2xl sm:text-4xl font-black">{goal.tasksCompleted}</div>
                        <div className="text-xs sm:text-sm text-white/80">tasks</div>
                      </div>
                    </div>
                    
                    {/* Commitment Stats */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                          <div className="text-sm sm:text-lg font-bold">{goal.daysWorking}</div>
                          <div className="text-xs text-white/80">days</div>
                        </div>
                        <div className="bg-white/20 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                          <div className="text-sm sm:text-lg font-bold">{Math.round(goal.tasksCompleted / goal.daysWorking)}</div>
                          <div className="text-xs text-white/80">avg/day</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Persistent</span>
                        <span className="sm:hidden">🏆</span>
                      </Badge>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-white/90">
                      <strong>Score:</strong> {goal.tasksCompleted} tasks / {goal.daysWorking} days
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Three-Column Layout: Morning Routine, Today's Tasks, Evening Routine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Morning Routine */}
          <Card className="border-0 shadow-lg relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <CardTitle className="text-base sm:text-lg">Morning Routine</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50"
                  onClick={() => {/* Add morning routine item */}}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Start your day with purpose
              </p>
              
              {/* Discipline Metrics Bar */}
              <div className="bg-amber-50 rounded-lg p-3 mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-amber-800">Today's Progress</span>
                  <span className="text-xs font-bold text-amber-800">{morningCompletionRate}%</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${morningCompletionRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{morningRoutines.filter(r => r.streak >= r.weeklyTarget).length}</div>
                    <div className="text-gray-600">On Track</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{Math.round(morningRoutines.reduce((acc, r) => acc + r.streak, 0) / morningRoutines.length)}</div>
                    <div className="text-gray-600">Avg Streak</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {morningRoutines.map((routine) => (
                  <div 
                    key={routine.id}
                    className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                      routine.completed ? 'bg-amber-50 border-amber-200' : 'border-gray-200 hover:bg-amber-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={routine.completed}
                      onChange={() => handleMorningRoutineToggle(routine.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm ${routine.completed ? 'text-amber-800 font-medium' : 'text-gray-700'}`}>
                        {routine.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          routine.streak >= routine.weeklyTarget 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {routine.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card className="border-0 shadow-lg relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">Today's Tasks</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                  onClick={() => {/* Add task */}}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {dayNames[selectedDay]}'s priorities
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentDayTasks.map((task) => {
                  const goal = getGoalById(task.goalId);
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                        task.completed ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleWeeklyTaskToggle(task.id)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs sm:text-sm ${task.completed ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                          {task.text}
                        </span>
                        {task.time && (
                          <p className="text-xs text-gray-500 mt-1">{task.time}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Evening Routine */}
          <Card className="border-0 shadow-lg relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  <CardTitle className="text-base sm:text-lg">Evening Routine</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => {/* Add evening routine item */}}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                End your day with reflection
              </p>
              
              {/* Discipline Metrics Bar */}
              <div className="bg-indigo-50 rounded-lg p-3 mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-indigo-800">Today's Progress</span>
                  <span className="text-xs font-bold text-indigo-800">{eveningCompletionRate}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${eveningCompletionRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{eveningRoutines.filter(r => r.streak >= r.weeklyTarget).length}</div>
                    <div className="text-gray-600">On Track</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{Math.round(eveningRoutines.reduce((acc, r) => acc + r.streak, 0) / eveningRoutines.length)}</div>
                    <div className="text-gray-600">Avg Streak</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {eveningRoutines.map((routine) => (
                  <div 
                    key={routine.id}
                    className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                      routine.completed ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-indigo-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={routine.completed}
                      onChange={() => handleEveningRoutineToggle(routine.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm ${routine.completed ? 'text-indigo-800 font-medium' : 'text-gray-700'}`}>
                        {routine.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          routine.streak >= routine.weeklyTarget 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {routine.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </main>

      <NewGoalModal 
        open={showNewGoalModal} 
        onOpenChange={setShowNewGoalModal}
        onSuccess={() => {}}
      />
      
      <NewHabitModal 
        open={showNewHabitModal} 
        onOpenChange={setShowNewHabitModal}
        onSuccess={() => {}}
      />
    </div>
  );
}