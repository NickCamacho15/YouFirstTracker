import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { NewTaskModal } from "@/components/tasks/new-task-modal";

import { HabitStoryBar } from "@/components/habits/habit-story-bar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Target, 
  CheckCircle2,
  Trophy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  
  // Critical tasks completion counter - tracks lifetime achievements
  const [criticalTasksCompleted, setCriticalTasksCompleted] = useState(147);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  
  // Goals with cumulative task completion tracking
  const [goals, setGoals] = useState([
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
            
            // Increment goal progress if task is linked to a goal
            if (task.goalId) {
              setGoals(prevGoals => prevGoals.map(goal => 
                goal.id === task.goalId 
                  ? { ...goal, tasksCompleted: goal.tasksCompleted + 1 }
                  : goal
              ));
            }
          } else if (!updatedTask.completed && task.completed) {
            setCriticalTasksCompleted(count => Math.max(0, count - 1));
            
            // Decrement goal progress if task is linked to a goal
            if (task.goalId) {
              setGoals(prevGoals => prevGoals.map(goal => 
                goal.id === task.goalId 
                  ? { ...goal, tasksCompleted: Math.max(0, goal.tasksCompleted - 1) }
                  : goal
              ));
            }
          }
          
          return updatedTask;
        }
        return task;
      })
    }));
  };

  const handleNewTask = (newTask: any) => {
    setWeeklyTasks(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay as keyof typeof prev] || []), newTask]
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

        {/* Weekly Metrics Bar Graph */}
        <div className="mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Weekly Overview</h3>
            <div className="space-y-3">
              {/* Reading - Target: 15h */}
              <div className="flex items-center">
                <div className="w-20 text-xs font-medium text-gray-600">Reading</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min((12.5 / 15) * 100, 100)}%`}}></div>
                  </div>
                </div>
                <div className="w-16 text-xs font-semibold text-right">12.5h / 15h</div>
                <div className="w-8 text-xs text-gray-500 text-right">83%</div>
              </div>

              {/* Meditation - Target: 3.5h */}
              <div className="flex items-center">
                <div className="w-20 text-xs font-medium text-gray-600">Meditation</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min((3.2 / 3.5) * 100, 100)}%`}}></div>
                  </div>
                </div>
                <div className="w-16 text-xs font-semibold text-right">3.2h / 3.5h</div>
                <div className="w-8 text-xs text-gray-500 text-right">91%</div>
              </div>

              {/* Screen Time - Target: 14h (lower is better) */}
              <div className="flex items-center">
                <div className="w-20 text-xs font-medium text-gray-600">Screen Time</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: `${Math.min((28 / 14) * 50, 100)}%`}}></div>
                  </div>
                </div>
                <div className="w-16 text-xs font-semibold text-right">28h / 14h</div>
                <div className="w-8 text-xs text-red-600 text-right">200%</div>
              </div>

              {/* Workouts - Target: 7h */}
              <div className="flex items-center">
                <div className="w-20 text-xs font-medium text-gray-600">Workouts</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${Math.min((6.8 / 7) * 100, 100)}%`}}></div>
                  </div>
                </div>
                <div className="w-16 text-xs font-semibold text-right">6.8h / 7h</div>
                <div className="w-8 text-xs text-gray-500 text-right">97%</div>
              </div>
            </div>
          </div>
        </div>





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