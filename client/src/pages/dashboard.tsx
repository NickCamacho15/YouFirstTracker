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
  Star
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set(['task-1']));
  const [dragProgress, setDragProgress] = useState<{ [key: string]: number }>({});
  
  // Sample tasks data - in real app this would come from API
  const [tasks, setTasks] = useState([
    { id: 'task-1', text: 'Review quarterly metrics', completed: true, goalId: 1 },
    { id: 'task-2', text: 'Prepare presentation slides', completed: false, time: 'Due 2 PM', goalId: 1 },
    { id: 'task-3', text: 'Team standup meeting', completed: false, time: '10 AM', goalId: 2 },
    { id: 'task-4', text: 'Update project timeline', completed: false, goalId: 2 },
    { id: 'task-5', text: 'Call insurance provider', completed: false, goalId: null },
  ]);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Haptic feedback function
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      // Rhythmic completion vibration: quick burst, pause, double burst
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };
  
  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
    triggerHapticFeedback();
    
    // Show completion celebration
    const celebrationElement = document.querySelector(`#celebration-${taskId}`);
    if (celebrationElement) {
      celebrationElement.classList.add('animate-bounce');
      setTimeout(() => {
        celebrationElement.classList.remove('animate-bounce');
      }, 1000);
    }
  };
  
  // Handle drag progress for slide-to-complete
  const handleDragStart = (taskId: string, event: React.MouseEvent | React.TouchEvent) => {
    const startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const slider = event.currentTarget as HTMLElement;
    const sliderRect = slider.getBoundingClientRect();
    const maxWidth = sliderRect.width - 48; // Account for slider button width
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const progress = Math.min(Math.max((currentX - startX) / maxWidth, 0), 1);
      setDragProgress(prev => ({ ...prev, [taskId]: progress }));
      
      // Haptic feedback at milestones
      if (progress > 0.5 && progress < 0.6 && 'vibrate' in navigator) {
        navigator.vibrate(50); // Light feedback at halfway
      }
    };
    
    const handleEnd = () => {
      const currentProgress = dragProgress[taskId] || 0;
      if (currentProgress > 0.8) {
        handleTaskComplete(taskId);
      }
      setDragProgress(prev => ({ ...prev, [taskId]: 0 }));
      
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  const { data: goals = [], refetch: refetchGoals } = useQuery({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  const { data: habits = [], refetch: refetchHabits } = useQuery({
    queryKey: ["/api/habits"],
    enabled: !!user,
  });

  const { data: readingSessions = [] } = useQuery({
    queryKey: ["/api/reading-sessions"],
    enabled: !!user,
  });

  const { data: visionItems = [] } = useQuery({
    queryKey: ["/api/vision-board"],
    enabled: !!user,
  });

  // Rotating vision board background
  const [currentVisionIndex, setCurrentVisionIndex] = useState(0);
  
  useEffect(() => {
    if (visionItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentVisionIndex((prev) => (prev + 1) % visionItems.length);
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [visionItems.length]);

  const currentVisionImage = visionItems.length > 0 ? visionItems[currentVisionIndex]?.imageUrl : null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Calculate statistics
  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter((goal: any) => goal.completed).length || 0;
  const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  const totalHabits = habits?.length || 0;
  const completedHabitsToday = habits?.filter((habit: any) => habit.completedToday).length || 0;
  const habitProgress = totalHabits > 0 ? (completedHabitsToday / totalHabits) * 100 : 0;
  
  const totalReadingSessions = readingSessions?.length || 0;
  const totalReadingMinutes = readingSessions?.reduce((total: number, session: any) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return total + Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }, 0) || 0;

  // Task completion statistics
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const taskProgress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
  
  // Tasks toward goals
  const tasksForGoal1 = tasks.filter(task => task.goalId === 1);
  const completedTasksForGoal1 = tasksForGoal1.filter(task => task.completed).length;
  const goal1Progress = tasksForGoal1.length > 0 ? (completedTasksForGoal1 / tasksForGoal1.length) * 100 : 0;
  
  const tasksForGoal2 = tasks.filter(task => task.goalId === 2);
  const completedTasksForGoal2 = tasksForGoal2.filter(task => task.completed).length;
  const goal2Progress = tasksForGoal2.length > 0 ? (completedTasksForGoal2 / tasksForGoal2.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">


        {/* Large Whoop-style Rings Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Habits Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={352}
                  strokeDashoffset={352 * (1 - (habitProgress / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-blue-600">
                  {Math.round(habitProgress)}%
                </span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">HABITS</div>
          </div>

          {/* Foundations Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#f59e0b" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={352}
                  strokeDashoffset={352 * (1 - 0.5)}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-amber-600">50%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">FOUNDATIONS</div>
          </div>

          {/* Tasks Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={352}
                  strokeDashoffset={352 * (1 - (taskProgress / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-emerald-600">
                  {Math.round(taskProgress)}%
                </span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">TASKS</div>
          </div>

          {/* Reading Ring */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#8b5cf6" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={352}
                  strokeDashoffset={352 * (1 - 0.6)}
                  strokeLinecap="round"
                  className="transition-all duration-700 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-purple-600">60%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">READING</div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Goals Quick Stat */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Goals</p>
                  <p className="text-2xl font-bold">{completedGoals}/{totalGoals}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Target className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={goalProgress} className="h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>

          {/* Habits Quick Stat */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Today's Habits</p>
                  <p className="text-2xl font-bold">{completedHabitsToday}/{totalHabits}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Flame className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={habitProgress} className="h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>

          {/* Reading Quick Stat */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Reading Time</p>
                  <p className="text-2xl font-bold">{totalReadingMinutes}m</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-emerald-100 text-sm">{totalReadingSessions} sessions</p>
              </div>
            </CardContent>
          </Card>

          {/* Streak Quick Stat */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Best Streak</p>
                  <p className="text-2xl font-bold">{Math.max(...(habits?.map((habit: any) => habit.streak) || [0]), 0)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-purple-100 text-sm">days strong</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Daily Tasks Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gray-600" />
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id)}
                      className="w-4 h-4 text-green-600 rounded cursor-pointer"
                    />
                    <span className={`flex-1 transition-all duration-300 ${
                      task.completed 
                        ? 'line-through text-gray-500 opacity-60' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {task.text}
                    </span>
                    {task.time && (
                      <span className={`text-xs px-2 py-1 rounded transition-opacity ${
                        task.completed 
                          ? 'opacity-40'
                          : task.time.includes('Due') 
                            ? 'text-orange-600 bg-orange-100' 
                            : 'text-blue-600 bg-blue-100'
                      }`}>
                        {task.time}
                      </span>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t space-y-3">
                  {/* Goal Progress Tracker */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <div className="font-medium mb-2">Progress toward Goals:</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Goal 1 (Work Project)</span>
                        <span className="text-xs font-medium">{completedTasksForGoal1}/{tasksForGoal1.length} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal1Progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Goal 2 (Team Leadership)</span>
                        <span className="text-xs font-medium">{completedTasksForGoal2}/{tasksForGoal2.length} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal2Progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habits Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Repeat className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl">Habits</CardTitle>
                </div>
                <Link href="/habits">
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {totalHabits === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Repeat className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground mb-4">Build your first habit and create momentum</p>
                  <Button onClick={() => setShowNewHabitModal(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {habits?.slice(0, 3).map((habit: any) => (
                    <div key={habit.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${habit.completedToday ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <div>
                          <p className="font-medium">{habit.title}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {habit.streak} day streak
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {habit.completedToday && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </div>
                  ))}
                  {totalHabits > 3 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{totalHabits - 3} more habits
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Goal Progression Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goal Progression</h2>
            <Link href="/goals">
              <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                <Target className="w-4 h-4 mr-2" />
                Manage Goals
              </Button>
            </Link>
          </div>
          
          {totalGoals === 0 ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Set Your First Goal</h3>
                <p className="text-muted-foreground mb-4">Transform your aspirations into actionable goals with micro-steps</p>
                <Button onClick={() => setShowNewGoalModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Goals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(goals as any[])?.slice(0, 6).map((goal: any) => (
                  <Card key={goal.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-4 h-4 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-blue-500'} flex-shrink-0 mt-1`} />
                        {goal.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                      )}
                      
                      {/* Micro Goals Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="text-muted-foreground">
                            {goal.microGoals?.filter((mg: any) => mg.completed).length || 0}/
                            {goal.microGoals?.length || 0} steps
                          </span>
                        </div>
                        
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              goal.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${goal.microGoals?.length > 0 
                                ? (goal.microGoals.filter((mg: any) => mg.completed).length / goal.microGoals.length) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                        
                        {goal.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(goal.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Future Folder - Vision Board Integration */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Future Folder</CardTitle>
                        <p className="text-sm text-muted-foreground">Visualize your aspirations and future goals</p>
                      </div>
                    </div>
                    <Link href="/vision">
                      <Button variant="outline" className="text-purple-600 hover:text-purple-700">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        View Vision Board
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Vision placeholder tiles */}
                    <div className="aspect-square bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-700">
                      <div className="text-center">
                        <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-purple-600 dark:text-purple-400">Add Vision</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700">
                      <div className="text-center">
                        <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs text-blue-600 dark:text-blue-400">Future Goal</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                      <div className="text-center">
                        <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Dream Big</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-orange-300 dark:border-orange-700">
                      <div className="text-center">
                        <Plus className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-xs text-orange-600 dark:text-orange-400">Inspiration</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-6">
                    <Link href="/vision">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Star className="w-4 h-4 mr-2" />
                        Create Your Future Vision
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Additional Sections Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Reading Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl">Reading</CardTitle>
                </div>
                <Link href="/read">
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {totalReadingSessions === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground mb-4">Start your reading journey</p>
                  <Link href="/read">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Clock className="w-4 h-4 mr-2" />
                      Start Reading
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{totalReadingMinutes}</p>
                      <p className="text-sm text-muted-foreground">minutes read</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{totalReadingSessions}</p>
                      <p className="text-sm text-muted-foreground">sessions</p>
                    </div>
                  </div>
                  <Link href="/read">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Continue Reading
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </main>

      <NewGoalModal
        open={showNewGoalModal}
        onOpenChange={setShowNewGoalModal}
        onSuccess={refetchGoals}
      />

      <NewHabitModal
        open={showNewHabitModal}
        onOpenChange={setShowNewHabitModal}
        onSuccess={refetchHabits}
      />
    </div>
  );
}