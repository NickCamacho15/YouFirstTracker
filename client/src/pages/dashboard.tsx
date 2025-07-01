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
  ChevronDown
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  
  // Combined tasks, routines, and critical items - in real app this would come from API
  const [tasks, setTasks] = useState([
    { id: 'routine-1', text: 'Meditation (10 min)', completed: true, type: 'routine', category: 'Morning', priority: 1 },
    { id: 'critical-1', text: 'Review quarterly metrics', completed: false, type: 'critical', time: 'Due 2 PM', goalId: 1, priority: 2 },
    { id: 'routine-2', text: 'Exercise', completed: false, type: 'routine', category: 'Morning', priority: 3 },
    { id: 'task-1', text: 'Prepare presentation slides', completed: false, type: 'task', goalId: 1, priority: 4 },
    { id: 'routine-3', text: 'Healthy breakfast', completed: false, type: 'routine', category: 'Morning', priority: 5 },
    { id: 'critical-2', text: 'Team standup meeting', completed: false, type: 'critical', time: '10 AM', goalId: 2, priority: 6 },
    { id: 'task-2', text: 'Update project timeline', completed: false, type: 'task', goalId: 2, priority: 7 },
    { id: 'routine-4', text: 'Daily reflection', completed: false, type: 'routine', category: 'Evening', priority: 8 },
    { id: 'task-3', text: 'Call insurance provider', completed: false, type: 'task', goalId: null, priority: 9 },
    { id: 'routine-5', text: 'Reading (30 min)', completed: false, type: 'routine', category: 'Evening', priority: 10 },
  ]);

  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask === targetTaskId) return;

    setTasks(prev => {
      const draggedIndex = prev.findIndex(task => task.id === draggedTask);
      const targetIndex = prev.findIndex(task => task.id === targetTaskId);
      
      const newTasks = [...prev];
      const [draggedItem] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, draggedItem);
      
      // Update priorities based on new order
      return newTasks.map((task, index) => ({
        ...task,
        priority: index + 1
      }));
    });
    
    setDraggedTask(null);
  };

  const movePriority = (taskId: string, direction: 'up' | 'down') => {
    setTasks(prev => {
      const sortedTasks = [...prev].sort((a, b) => a.priority - b.priority);
      const taskIndex = sortedTasks.findIndex(task => task.id === taskId);
      
      if (direction === 'up' && taskIndex > 0) {
        [sortedTasks[taskIndex], sortedTasks[taskIndex - 1]] = [sortedTasks[taskIndex - 1], sortedTasks[taskIndex]];
      } else if (direction === 'down' && taskIndex < sortedTasks.length - 1) {
        [sortedTasks[taskIndex], sortedTasks[taskIndex + 1]] = [sortedTasks[taskIndex + 1], sortedTasks[taskIndex]];
      }
      
      // Update priorities
      return sortedTasks.map((task, index) => ({
        ...task,
        priority: index + 1
      }));
    });
  };



  return (
    <div className="min-h-screen bg-white">
      <main className="p-4 pb-20">
        {/* Progress Circles Overview - Free Floating */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Habits Progress */}
          <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
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
                <span className="text-xl font-bold text-gray-900">75%</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Habits</h3>
            <p className="text-xs text-gray-500">Daily completion</p>
          </div>

          {/* Tasks Progress */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                  strokeDasharray={`${40}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">40%</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Tasks</h3>
            <p className="text-xs text-gray-500">Today's progress</p>
          </div>

          {/* Goals Progress */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                <span className="text-xl font-bold text-gray-900">65%</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Goals</h3>
            <p className="text-xs text-gray-500">Weekly targets</p>
          </div>

          {/* Reading Progress */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                  strokeDasharray={`${85}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">85%</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Reading</h3>
            <p className="text-xs text-gray-500">Monthly goal</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/goals">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Goals</h3>
                <p className="text-xs text-gray-500 mt-1">Future Folder</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/habits">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Repeat className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Habits</h3>
                <p className="text-xs text-gray-500 mt-1">67-day formation</p>
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

          <Link href="/community">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Community</h3>
                <p className="text-xs text-gray-500 mt-1">Share progress</p>
              </CardContent>
            </Card>
          </Link>
        </div>





        {/* Today's Tasks - To-Do List */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-600" />
              Today's Tasks & Routines
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Critical tasks, routines, and regular tasks - drag to reorder priorities
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks
                .sort((a, b) => a.priority - b.priority)
                .map((task, index) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, task.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-move
                    ${draggedTask === task.id ? 'opacity-50 bg-blue-50' : 'hover:bg-gray-50'}
                    ${task.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'}
                  `}
                >
                  {/* Priority Number */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-1 min-w-[24px] text-center">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => movePriority(task.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => movePriority(task.id, 'down')}
                        disabled={index === tasks.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task.id)}
                    className="w-4 h-4 text-green-600 rounded cursor-pointer"
                  />

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`block transition-all duration-300 ${
                        task.completed 
                          ? 'line-through text-gray-500 opacity-60' 
                          : 'text-gray-900'
                      }`}>
                        {task.text}
                      </span>
                      
                      {/* Type Badge */}
                      {task.type === 'critical' && (
                        <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-100">
                          Critical
                        </Badge>
                      )}
                      {task.type === 'routine' && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                    
                    {task.time && (
                      <span className={`text-xs px-2 py-1 rounded inline-block transition-opacity ${
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

                  {/* Drag Handle */}
                  <div className="text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                    </svg>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add new task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Performance Calendar */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              Daily Performance Calendar
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Track your daily scores and identify patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`day-${index}`} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }, (_, i) => {
                const dayNumber = i + 1;
                const score = Math.floor(Math.random() * 100) + 1;
                const isToday = dayNumber === 15;
                const gradientClass = 
                  score >= 90 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                  score >= 80 ? 'bg-gradient-to-br from-green-300 to-green-500' :
                  score >= 70 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' :
                  score >= 60 ? 'bg-gradient-to-br from-orange-300 to-orange-500' :
                  'bg-gradient-to-br from-red-300 to-red-500';
                
                return (
                  <div
                    key={`score-${i}`}
                    className={`
                      aspect-square rounded-md flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-200 hover:scale-110 shadow-sm
                      ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      ${gradientClass}
                    `}
                    title={`Day ${dayNumber}: ${score}% performance`}
                  >
                    <span className="text-sm">{score}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                  <span>90+</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded"></div>
                  <span>70+</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-300 to-red-500 rounded"></div>
                  <span>&lt;70</span>
                </div>
              </div>
              <span>Today: 85%</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/goals">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Goals</h3>
                <p className="text-xs text-gray-500 mt-1">Future Folder</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/habits">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Repeat className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Habits</h3>
                <p className="text-xs text-gray-500 mt-1">67-day formation</p>
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

          <Link href="/community">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Community</h3>
                <p className="text-xs text-gray-500 mt-1">Share progress</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Modals */}
        <NewGoalModal 
          open={showNewGoalModal} 
          onOpenChange={setShowNewGoalModal}
          onSuccess={() => setShowNewGoalModal(false)}
        />
        <NewHabitModal 
          open={showNewHabitModal} 
          onOpenChange={setShowNewHabitModal}
          onSuccess={() => setShowNewHabitModal(false)}
        />
      </main>
    </div>
  );
}