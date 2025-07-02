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

  // Critical tasks tied to goals
  const [criticalTasks, setCriticalTasks] = useState([
    { id: 'critical-1', text: 'Review quarterly metrics', completed: false, goalId: 1, time: 'Due 2 PM', priority: 1 },
    { id: 'critical-2', text: 'Team standup meeting', completed: false, goalId: 2, time: '10 AM', priority: 2 },
    { id: 'critical-3', text: 'Prepare presentation slides', completed: false, goalId: 1, priority: 3 },
    { id: 'critical-4', text: 'Update project timeline', completed: false, goalId: 2, priority: 4 },
    { id: 'critical-5', text: 'Doctor appointment', completed: false, goalId: 3, time: '3 PM', priority: 5 }
  ]);

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

  const handleCriticalTaskToggle = (taskId: string) => {
    setCriticalTasks(prev => prev.map(task => {
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
        {/* Progress Circles Overview - Free Floating */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Habits Progress */}
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
                  strokeDasharray={`${80}, 100`}
                  className="drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">80%</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Reading</h3>
            <p className="text-xs text-gray-500">Weekly goal</p>
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

        {/* Today's Tasks */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Today's Tasks
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Important tasks that drive your goals forward
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalTasks.map((task, index) => {
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
                      onChange={() => handleCriticalTaskToggle(task.id)}
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