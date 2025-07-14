import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, Target, Shield, Layers, Star, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { NewGoalModal } from '@/components/goals/new-goal-modal';
import { NewTaskModal } from '@/components/dashboard/new-task-modal';

interface Goal {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  benefits?: string[];
  consequences?: string[];
  peopleHelped?: string[];
  microGoals: Array<{
    id: number;
    title: string;
    completed: boolean;
  }>;
}

interface Task {
  id: string;
  text: string;
  time?: string;
  completed: boolean;
  type: 'morning' | 'evening' | 'critical' | 'today';
  goalId: number;
}

interface RoutineTask {
  id: string;
  text: string;
  completed: boolean;
  streak: number;
  weeklyTarget: number;
}

export default function DashboardPage() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const [morningRoutines, setMorningRoutines] = useState<RoutineTask[]>([
    { id: 'morning-1', text: 'Morning Prayer & Meditation', completed: false, streak: 12, weeklyTarget: 7 },
    { id: 'morning-2', text: 'Exercise & Movement', completed: false, streak: 8, weeklyTarget: 5 },
    { id: 'morning-3', text: 'Healthy Breakfast', completed: false, streak: 15, weeklyTarget: 7 },
    { id: 'morning-4', text: 'Review Daily Priorities', completed: false, streak: 6, weeklyTarget: 7 }
  ]);

  const [eveningRoutines, setEveningRoutines] = useState<RoutineTask[]>([
    { id: 'evening-1', text: 'Daily Reflection Journal', completed: false, streak: 9, weeklyTarget: 7 },
    { id: 'evening-2', text: 'Reading (30 min)', completed: false, streak: 11, weeklyTarget: 6 },
    { id: 'evening-3', text: 'Prepare Tomorrow', completed: false, streak: 4, weeklyTarget: 7 },
    { id: 'evening-4', text: 'Gratitude Practice', completed: false, streak: 14, weeklyTarget: 7 }
  ]);

  const [weeklyTasks, setWeeklyTasks] = useState<{ [key: number]: Task[] }>({
    0: [ // Sunday
      { id: 'sun-1', text: 'Weekly planning & reflection', completed: false, type: 'today', goalId: 1 },
      { id: 'sun-2', text: 'Meal prep for the week', completed: false, type: 'today', goalId: 2 },
      { id: 'sun-3', text: 'Review financial goals', completed: false, type: 'today', goalId: 3 },
    ],
    1: [ // Monday
      { id: 'mon-1', text: 'Team meeting preparation', completed: false, type: 'today', goalId: 1 },
      { id: 'mon-2', text: 'Work on strategic project', time: '10:00 AM', completed: false, type: 'today', goalId: 2 },
      { id: 'mon-3', text: 'Gym - Upper body workout', time: '6:00 PM', completed: false, type: 'today', goalId: 3 },
      { id: 'mon-4', text: 'Call Mom', time: '7:30 PM', completed: false, type: 'today', goalId: 4 },
    ],
    2: [ // Tuesday
      { id: 'tue-1', text: 'Client presentation prep', completed: false, type: 'today', goalId: 1 },
      { id: 'tue-2', text: 'Deep work block', time: '9:00 AM - 12:00 PM', completed: false, type: 'today', goalId: 2 },
      { id: 'tue-3', text: 'Cardio & core workout', time: '5:30 PM', completed: false, type: 'today', goalId: 3 },
    ],
    3: [ // Wednesday
      { id: 'wed-1', text: 'Mid-week review', completed: false, type: 'today', goalId: 1 },
      { id: 'wed-2', text: 'Professional development', time: '2:00 PM', completed: false, type: 'today', goalId: 2 },
      { id: 'wed-3', text: 'Yoga & meditation', time: '6:00 PM', completed: false, type: 'today', goalId: 3 },
    ],
    4: [ // Thursday
      { id: 'thu-1', text: 'Project milestone check', completed: false, type: 'today', goalId: 1 },
      { id: 'thu-2', text: 'Networking event', time: '5:00 PM', completed: false, type: 'today', goalId: 2 },
      { id: 'thu-3', text: 'Lower body workout', time: '6:30 AM', completed: false, type: 'today', goalId: 3 },
    ],
    5: [ // Friday
      { id: 'fri-1', text: 'Weekly report completion', completed: false, type: 'today', goalId: 1 },
      { id: 'fri-2', text: 'Team retrospective', time: '3:00 PM', completed: false, type: 'today', goalId: 2 },
      { id: 'fri-3', text: 'Plan weekend activities', completed: false, type: 'today', goalId: 4 },
    ],
    6: [ // Saturday
      { id: 'sat-1', text: 'Long run or hike', time: '7:00 AM', completed: false, type: 'today', goalId: 3 },
      { id: 'sat-2', text: 'Personal project time', completed: false, type: 'today', goalId: 2 },
      { id: 'sat-3', text: 'Social activity', time: 'Evening', completed: false, type: 'today', goalId: 4 },
    ]
  });

  // Get tasks for the selected day
  const currentDayTasks = weeklyTasks[selectedDay] || [];

  // Calculate total completed tasks (cumulative counter)
  const criticalTasksCompleted = Object.values(weeklyTasks).flat().filter(t => t.completed).length + 147; // Adding base amount for long-term tracking

  const handleWeeklyTaskToggle = (taskId: string) => {
    setWeeklyTasks(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleNewTask = (taskData: { text: string; goalId: number; time?: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: taskData.text,
      time: taskData.time,
      completed: false,
      type: 'today',
      goalId: taskData.goalId
    };

    setWeeklyTasks(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newTask]
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


        {/* Weekly Overview - Standalone Tiles */}
        <div className="mb-6">
          <div className="space-y-3">
            {/* Reading Tile */}
            <div className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-200 overflow-hidden">
              {/* Background Bar Chart */}
              <div className="absolute inset-0 flex items-end justify-end gap-1 p-2 opacity-10">
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '75%'}}></div>
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '90%'}}></div>
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '45%'}}></div>
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '85%'}}></div>
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                <div className="w-2 bg-blue-500 rounded-t" style={{height: '55%'}}></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Reading</h4>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-lg font-bold text-gray-900">12.5h</p>
                    <p className="text-sm font-bold text-blue-600">1.8h daily</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">83%</p>
                  <p className="text-xs text-gray-500">of 15h goal</p>
                </div>
              </div>
            </div>

            {/* Meditation Tile */}
            <div className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-200 overflow-hidden">
              {/* Background Bar Chart */}
              <div className="absolute inset-0 flex items-end justify-end gap-1 p-2 opacity-10">
                <div className="w-2 bg-green-500 rounded-t" style={{height: '80%'}}></div>
                <div className="w-2 bg-green-500 rounded-t" style={{height: '95%'}}></div>
                <div className="w-2 bg-green-500 rounded-t" style={{height: '70%'}}></div>
                <div className="w-2 bg-green-500 rounded-t" style={{height: '100%'}}></div>
                <div className="w-2 bg-green-500 rounded-t" style={{height: '85%'}}></div>
                <div className="w-2 bg-green-500 rounded-t" style={{height: '90%'}}></div>
                <div className="w-2 bg-green-500 rounded-t" style={{height: '75%'}}></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Meditation</h4>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-lg font-bold text-gray-900">3.2h</p>
                    <p className="text-sm font-bold text-green-600">27m daily</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">91%</p>
                  <p className="text-xs text-gray-500">of 3.5h goal</p>
                </div>
              </div>
            </div>

            {/* Screen Time Tile */}
            <div className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-200 overflow-hidden">
              {/* Background Bar Chart */}
              <div className="absolute inset-0 flex items-end justify-end gap-1 p-2 opacity-10">
                <div className="w-2 bg-red-500 rounded-t" style={{height: '90%'}}></div>
                <div className="w-2 bg-red-500 rounded-t" style={{height: '100%'}}></div>
                <div className="w-2 bg-red-500 rounded-t" style={{height: '85%'}}></div>
                <div className="w-2 bg-red-500 rounded-t" style={{height: '95%'}}></div>
                <div className="w-2 bg-red-500 rounded-t" style={{height: '100%'}}></div>
                <div className="w-2 bg-red-500 rounded-t" style={{height: '90%'}}></div>
                <div className="w-2 bg-red-500 rounded-t" style={{height: '80%'}}></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Screen Time</h4>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-lg font-bold text-gray-900">28h</p>
                    <p className="text-sm font-bold text-red-600">4h daily</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-red-600">200%</p>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-500">limit exceeded</p>
                </div>
              </div>
            </div>

            {/* Workouts Tile */}
            <div className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-200 overflow-hidden">
              {/* Background Bar Chart */}
              <div className="absolute inset-0 flex items-end justify-end gap-1 p-2 opacity-10">
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '85%'}}></div>
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '70%'}}></div>
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '100%'}}></div>
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '80%'}}></div>
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '95%'}}></div>
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '90%'}}></div>
                <div className="w-2 bg-orange-500 rounded-t" style={{height: '75%'}}></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Workouts</h4>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-lg font-bold text-gray-900">6.8h</p>
                    <p className="text-sm font-bold text-orange-600">58m daily</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">97%</p>
                  <p className="text-xs text-gray-500">of 7h goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day of Week Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(selectedDay === 0 ? 6 : selectedDay - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{dayNames[selectedDay]}</div>
              <div className="text-xs text-gray-500">Daily Routines</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay((selectedDay + 1) % 7)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Morning Routine */}
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Morning Priming</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewTaskModal(true)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {morningRoutines.map((routine) => {
                const completionRate = Math.round((routine.streak / routine.weeklyTarget) * 100);
                return (
                  <div key={routine.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            routine.completed 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                          onClick={() => handleMorningRoutineToggle(routine.id)}
                        >
                          {routine.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${routine.completed ? 'text-gray-500' : 'text-gray-800'}`}>
                          {routine.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          routine.streak >= 7 ? 'bg-green-100 text-green-800' : 
                          routine.streak >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {routine.streak} day streak
                        </div>
                      </div>
                    </div>
                    
                    {/* Discipline Metrics Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Weekly Progress</span>
                        <span className="text-xs font-semibold text-blue-600">{completionRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(completionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks with Long-term Tracking */}
        <Card className="border-0 shadow-lg mb-6">
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
                onClick={() => setShowNewTaskModal(true)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs sm:text-sm text-gray-600">
                {dayNames[selectedDay]}'s priorities
              </p>
              <div className="text-xs text-gray-500">
                <span className="font-semibold text-blue-600">{criticalTasksCompleted}</span> total tasks completed
              </div>
            </div>
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
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Evening Reflection</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewTaskModal(true)}
                className="h-8 w-8 p-0 hover:bg-purple-100"
              >
                <Plus className="w-4 h-4 text-purple-600" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {eveningRoutines.map((routine) => {
                const completionRate = Math.round((routine.streak / routine.weeklyTarget) * 100);
                return (
                  <div key={routine.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            routine.completed 
                              ? 'bg-purple-600 border-purple-600' 
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                          onClick={() => handleEveningRoutineToggle(routine.id)}
                        >
                          {routine.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${routine.completed ? 'text-gray-500' : 'text-gray-800'}`}>
                          {routine.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          routine.streak >= 7 ? 'bg-green-100 text-green-800' : 
                          routine.streak >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {routine.streak} day streak
                        </div>
                      </div>
                    </div>
                    
                    {/* Discipline Metrics Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Weekly Progress</span>
                        <span className="text-xs font-semibold text-purple-600">{completionRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(completionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mastery Dashboard */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Personal Mastery Dashboard</CardTitle>
                  <p className="text-sm text-gray-600">Your excellence metrics at a glance</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Tasks Completed */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{criticalTasksCompleted}</div>
                <p className="text-sm text-gray-600 mt-1">Tasks Completed</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">lifetime</span>
                </div>
              </div>

              {/* Current Streaks */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...morningRoutines.map(r => r.streak), ...eveningRoutines.map(r => r.streak))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Best Streak</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Flame className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">days</span>
                </div>
              </div>

              {/* Consistency Score */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <p className="text-sm text-gray-600 mt-1">Consistency</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-600">this month</span>
                </div>
              </div>

              {/* Active Goals */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{goals.filter(g => !g.completed).length}</div>
                <p className="text-sm text-gray-600 mt-1">Active Goals</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-600">in progress</span>
                </div>
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

      <NewTaskModal
        open={showNewTaskModal}
        onOpenChange={setShowNewTaskModal}
        onSuccess={handleNewTask}
        goals={goals}
        selectedDay={selectedDay}
      />
    </div>
  );
}