import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, Target, Shield, Layers, Star, Flame } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Routine } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { NewGoalModal } from '@/components/goals/new-goal-modal';
import { NewTaskModal } from '@/components/dashboard/new-task-modal';
import { DayTrackerCalendar } from '@/components/dashboard/day-tracker-calendar';

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

  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: morningRoutinesData = [], isLoading: morningLoading } = useQuery<Routine[]>({
    queryKey: ['/api/morning-routines'],
  });

  const { data: eveningRoutinesData = [], isLoading: eveningLoading } = useQuery<Routine[]>({
    queryKey: ['/api/evening-routines'],
  });

  // Convert database routines to RoutineTask format
  const morningRoutines: RoutineTask[] = morningRoutinesData.map(routine => ({
    id: routine.id.toString(),
    text: routine.text,
    completed: routine.completed,
    streak: routine.streak,
    weeklyTarget: routine.weeklyTarget
  }));

  const eveningRoutines: RoutineTask[] = eveningRoutinesData.map(routine => ({
    id: routine.id.toString(),
    text: routine.text,
    completed: routine.completed,
    streak: routine.streak,
    weeklyTarget: routine.weeklyTarget
  }));

  // Organize tasks by day of week
  const weeklyTasks = useMemo(() => {
    const tasksByDay: { [key: number]: Task[] } = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
    
    // Assign tasks to days based on timeframe property
    tasks.forEach(task => {
      // For now, assign all tasks to current day
      // In a real implementation, you'd use the task's due date or day property
      const dayNumber = selectedDay;
      if (!tasksByDay[dayNumber]) {
        tasksByDay[dayNumber] = [];
      }
      tasksByDay[dayNumber].push(task);
    });
    
    return tasksByDay;
  }, [tasks, selectedDay]);

  // Get tasks for the selected day
  const currentDayTasks = weeklyTasks[selectedDay] || [];

  // Calculate total completed tasks
  const criticalTasksCompleted = Object.values(weeklyTasks).flat().filter(t => t.completed).length;

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number, completed: boolean }) => {
      const response = await apiRequest(`/api/tasks/${taskId}`, { 
        method: 'PUT', 
        body: { completed } 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const handleWeeklyTaskToggle = (taskId: string) => {
    const id = parseInt(taskId);
    const task = tasks.find(t => t.id === id);
    if (task) {
      toggleTaskMutation.mutate({ 
        taskId: id, 
        completed: !task.completed 
      });
    }
  };

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; goalId: number; timeframe: string; dueDate?: string }) => {
      const response = await apiRequest('/api/tasks', { 
        method: 'POST', 
        body: data 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setShowNewTaskModal(false);
    }
  });

  const handleNewTask = (taskData: { text: string; goalId: number; time?: string }) => {
    createTaskMutation.mutate({
      title: taskData.text,
      goalId: taskData.goalId,
      timeframe: 'today',
      dueDate: taskData.time
    });
  };

  const toggleRoutineMutation = useMutation({
    mutationFn: async ({ routineId, completed }: { routineId: number, completed: boolean }) => {
      const response = await apiRequest(`/api/routines/${routineId}`, { 
        method: 'PUT', 
        body: { completed } 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/morning-routines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/evening-routines'] });
    }
  });

  const handleMorningRoutineToggle = (taskId: string) => {
    const id = parseInt(taskId);
    const routine = morningRoutinesData.find(r => r.id === id);
    if (routine) {
      toggleRoutineMutation.mutate({
        routineId: id,
        completed: !routine.completed
      });
    }
  };

  const handleEveningRoutineToggle = (taskId: string) => {
    const id = parseInt(taskId);
    const routine = eveningRoutinesData.find(r => r.id === id);
    if (routine) {
      toggleRoutineMutation.mutate({
        routineId: id,
        completed: !routine.completed
      });
    }
  };

  const getGoalById = (goalId: number) => goals.find(g => g.id === goalId);

  return (
    <div className="min-h-screen bg-white">
      <main className="p-4 pb-24">
        {/* Day Tracker Calendar */}
        <div className="mb-6">
          <DayTrackerCalendar />
        </div>

        {/* Weekly Overview - Standalone Tiles */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base sm:text-lg">Weekly Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Reading Tile */}
              <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 overflow-hidden">
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
                    <h4 className="text-sm font-medium text-gray-700">Reading</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">0h</p>
                      <p className="text-sm font-medium text-blue-600">0h daily</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">0%</p>
                    <p className="text-xs text-gray-600">of 15h goal</p>
                  </div>
                </div>
              </div>

            {/* Meditation Tile */}
              <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 overflow-hidden">
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
                    <h4 className="text-sm font-medium text-gray-700">Meditation</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">0h</p>
                      <p className="text-sm font-medium text-green-600">0m daily</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">0%</p>
                    <p className="text-xs text-gray-600">of 3.5h goal</p>
                  </div>
                </div>
              </div>

              {/* Screen Time Tile */}
              <div className="relative bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-100 overflow-hidden">
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
                    <h4 className="text-sm font-medium text-gray-700">Screen Time</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">0h</p>
                      <p className="text-sm font-medium text-red-600">0h daily</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold text-red-600">0%</p>
                    </div>
                    <p className="text-xs text-gray-600">of limit</p>
                  </div>
                </div>
              </div>

              {/* Workouts Tile */}
              <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100 overflow-hidden">
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
                    <h4 className="text-sm font-medium text-gray-700">Workouts</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">0h</p>
                      <p className="text-sm font-medium text-orange-600">0m daily</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">0%</p>
                    <p className="text-xs text-gray-600">of 7h goal</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day of Week Selector */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-2">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDay(selectedDay === 0 ? 6 : selectedDay - 1)}
                className="h-10 w-10 p-0 hover:bg-blue-100"
              >
                <ChevronLeft className="w-5 h-5 text-blue-600" />
              </Button>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{dayNames[selectedDay]}</div>
                <div className="text-sm text-gray-600">Daily Routines</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDay((selectedDay + 1) % 7)}
                className="h-10 w-10 p-0 hover:bg-blue-100"
              >
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Morning Routine */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-base sm:text-lg">Morning Priming</CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewTaskModal(true)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </Button>
            </div>
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
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <CardTitle className="text-base sm:text-lg">Evening Reflection</CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewTaskModal(true)}
                className="h-8 w-8 p-0 hover:bg-purple-100"
              >
                <Plus className="w-4 h-4 text-purple-600" />
              </Button>
            </div>
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
                <div className="text-2xl font-bold text-purple-600">0%</div>
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