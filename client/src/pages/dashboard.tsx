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
  Moon
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

  // Morning routines
  const [morningRoutines, setMorningRoutines] = useState([
    { id: 'morning-1', text: 'Meditation (10 min)', completed: true, priority: 1 },
    { id: 'morning-2', text: 'Exercise', completed: false, priority: 2 },
    { id: 'morning-3', text: 'Healthy breakfast', completed: false, priority: 3 },
    { id: 'morning-4', text: 'Review daily priorities', completed: false, priority: 4 }
  ]);

  // Evening routines
  const [eveningRoutines, setEveningRoutines] = useState([
    { id: 'evening-1', text: 'Daily reflection', completed: false, priority: 1 },
    { id: 'evening-2', text: 'Reading (30 min)', completed: false, priority: 2 },
    { id: 'evening-3', text: 'Prepare tomorrow', completed: false, priority: 3 },
    { id: 'evening-4', text: 'Gratitude practice', completed: false, priority: 4 }
  ]);

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
      <main className="p-4 pb-20">
        {/* Gamified Visual Analytics Dashboard */}
        <div className="mb-8">
          {/* Performance Visual Layout - Colorful Expanding Data */}
          <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-8 shadow-2xl border border-indigo-100 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Personal Excellence Analytics</h2>
              
              {/* Central Visual Data Layout - Expanding Toward Edges */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Habit Ecosystem Visual */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Habit Ecosystem</h3>
                  <div className="relative w-48 h-48 mx-auto">
                    {/* Central Core */}
                    <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Core</span>
                    </div>
                    
                    {/* Mind Ring - Blue */}
                    <div className="absolute inset-0 border-8 border-transparent rounded-full">
                      <div 
                        className="w-full h-full rounded-full border-8 border-blue-400/60 relative"
                        style={{
                          background: `conic-gradient(from 0deg, #3b82f6 0deg, #3b82f6 ${75 * 3.6}deg, transparent ${75 * 3.6}deg, transparent 360deg)`
                        }}
                      >
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">M</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Body Ring - Orange */}
                    <div className="absolute inset-4 border-8 border-transparent rounded-full">
                      <div 
                        className="w-full h-full rounded-full border-8 border-orange-400/60 relative"
                        style={{
                          background: `conic-gradient(from 120deg, #f97316 0deg, #f97316 ${60 * 3.6}deg, transparent ${60 * 3.6}deg, transparent 360deg)`
                        }}
                      >
                        <div className="absolute top-0 right-0 w-6 h-6 bg-orange-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">B</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Soul Ring - Purple */}
                    <div className="absolute inset-8 border-8 border-transparent rounded-full">
                      <div 
                        className="w-full h-full rounded-full border-8 border-purple-400/60 relative"
                        style={{
                          background: `conic-gradient(from 240deg, #8b5cf6 0deg, #8b5cf6 ${85 * 3.6}deg, transparent ${85 * 3.6}deg, transparent 360deg)`
                        }}
                      >
                        <div className="absolute bottom-0 left-1/2 transform translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Data Points */}
                    <div className="absolute -top-6 -left-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Mind 75%
                    </div>
                    <div className="absolute -top-6 -right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Body 60%
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Soul 85%
                    </div>
                  </div>
                </div>

                {/* Center: Performance Radar */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Performance Matrix</h3>
                  <div className="relative w-48 h-48 mx-auto">
                    {/* Hexagonal Radar Background */}
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Grid Lines */}
                      <defs>
                        <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#f0f9ff" />
                          <stop offset="100%" stopColor="#e0e7ff" />
                        </radialGradient>
                      </defs>
                      
                      {/* Background Rings */}
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
                        <polygon
                          key={i}
                          points="100,20 173,50 173,150 100,180 27,150 27,50"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          transform={`scale(${scale})`}
                          style={{ transformOrigin: '100px 100px' }}
                        />
                      ))}
                      
                      {/* Data Polygon - Colorful Fill */}
                      <polygon
                        points="100,35 156,55 156,135 100,165 44,135 44,55"
                        fill="url(#performanceGradient)"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        opacity="0.8"
                      />
                      
                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      
                      {/* Data Points */}
                      <circle cx="100" cy="35" r="4" fill="#4f46e5" />
                      <circle cx="156" cy="55" r="4" fill="#7c3aed" />
                      <circle cx="156" cy="135" r="4" fill="#ec4899" />
                      <circle cx="100" cy="165" r="4" fill="#f59e0b" />
                      <circle cx="44" cy="135" r="4" fill="#10b981" />
                      <circle cx="44" cy="55" r="4" fill="#3b82f6" />
                    </svg>
                    
                    {/* Performance Labels */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-indigo-600">Consistency</div>
                    <div className="absolute top-8 -right-8 text-xs font-semibold text-purple-600">Momentum</div>
                    <div className="absolute bottom-8 -right-8 text-xs font-semibold text-pink-600">Growth</div>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-amber-600">Balance</div>
                    <div className="absolute bottom-8 -left-8 text-xs font-semibold text-emerald-600">Focus</div>
                    <div className="absolute top-8 -left-8 text-xs font-semibold text-blue-600">Excellence</div>
                  </div>
                  
                  {/* Overall Score */}
                  <div className="text-center mt-4">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">A-</div>
                    <div className="text-sm text-gray-600">Overall Performance</div>
                  </div>
                </div>

                {/* Right: Task Analytics */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Task Analytics</h3>
                  <div className="space-y-4">
                    {/* Task Completion Meter */}
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Today's Tasks</span>
                        <span className="text-sm font-bold text-blue-600">8/12</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style={{width: '67%'}}></div>
                      </div>
                    </div>
                    
                    {/* Goal Progress Bars */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Business</span>
                            <span>234 tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Leadership</span>
                            <span>187 tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '72%'}}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Personal</span>
                            <span>456 tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full" style={{width: '93%'}}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Home</span>
                            <span>98 tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Weekly Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">147</div>
                        <div className="text-xs text-blue-700">Total Complete</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-emerald-600">73%</div>
                        <div className="text-xs text-emerald-700">This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Grid with Task Counters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-600" />
              Active Goals
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Track task completion progress for each goal
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                return (
                  <div key={goal.id} className={`${goal.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                        <p className="text-white/90 text-sm">{goal.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black">{goal.tasksCompleted}</div>
                        <div className="text-sm text-white/80">tasks completed</div>
                      </div>
                    </div>
                    
                    {/* Commitment Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                          <div className="text-lg font-bold">{goal.daysWorking}</div>
                          <div className="text-xs text-white/80">days working</div>
                        </div>
                        <div className="bg-white/20 rounded-lg px-3 py-2">
                          <div className="text-lg font-bold">{Math.round(goal.tasksCompleted / goal.daysWorking)}</div>
                          <div className="text-xs text-white/80">avg/day</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        <Trophy className="w-3 h-3 mr-1" />
                        Persistent
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-white/90">
                      <strong>Commitment Score:</strong> {goal.tasksCompleted} tasks over {goal.daysWorking} days
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/goals">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Goals</h3>
                <p className="text-xs text-gray-500 mt-1">Set & track</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/habits">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Repeat className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Habits</h3>
                <p className="text-xs text-gray-500 mt-1">Build consistency</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/read">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Read</h3>
                <p className="text-xs text-gray-500 mt-1">Daily sessions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vision">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Vision</h3>
                <p className="text-xs text-gray-500 mt-1">Future Folder</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Morning Priming */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              Morning Priming
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Start your day with purposeful habits
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {morningRoutines.map((routine) => (
                <div 
                  key={routine.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    routine.completed ? 'bg-amber-50 border-amber-200' : 'border-gray-200 hover:bg-amber-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={routine.completed}
                    onChange={() => handleMorningRoutineToggle(routine.id)}
                    className="w-5 h-5 text-amber-600 rounded cursor-pointer"
                  />
                  <span className={`flex-1 transition-all duration-300 ${
                    routine.completed 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}>
                    {routine.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Tasks with Day Tabs */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Weekly Tasks
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Plan your week for maximum productivity
                </p>
              </div>
              
              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Tasks Completed</span>
                </div>
                <div className="text-2xl font-black text-blue-700">{criticalTasksCompleted}</div>
                <div className="text-xs text-blue-600">lifetime total</div>
              </div>
            </div>

            {/* Day Selection Tabs */}
            <div className="flex flex-wrap gap-1 mt-4 bg-gray-100 rounded-lg p-1">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const dayName = dayNames[day];
                const isSelected = selectedDay === day;
                const isToday = currentDay === day;
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : isToday
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dayName.slice(0, 3)}
                    {isToday && <span className="ml-1 text-xs">•</span>}
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {dayNames[selectedDay]} Tasks
                {selectedDay === currentDay && <span className="text-blue-600 ml-2">(Today)</span>}
              </h3>
            </div>
            <div className="space-y-3">
              {currentDayTasks.map((task, index) => {
                const goal = getGoalById(task.goalId);
                
                return (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleWeeklyTaskToggle(task.id)}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-semibold transition-all duration-300 ${
                          task.completed 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-900'
                        }`}>
                          {task.text}
                        </span>
                        {task.time && (
                          <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 bg-blue-100">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.time}
                          </Badge>
                        )}
                      </div>
                      {goal && (
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${goal.color}`}></div>
                          <span className="text-sm text-gray-600">{goal.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>



        {/* Evening Routines */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Evening Routines
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              End your day with reflection and preparation
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eveningRoutines.map((routine) => (
                <div 
                  key={routine.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    routine.completed ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-indigo-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={routine.completed}
                    onChange={() => handleEveningRoutineToggle(routine.id)}
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                  />
                  <span className={`flex-1 transition-all duration-300 ${
                    routine.completed 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}>
                    {routine.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar placeholder */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Today's Performance</CardTitle>
            <p className="text-sm text-gray-600">Track your daily progress and momentum</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-600">Calendar view coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
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