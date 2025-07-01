import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Vision Board Header */}
      <div className="relative h-64 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 overflow-hidden">
        {/* Nature Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/90 via-indigo-500/90 to-purple-600/90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c20-10 40 0 60-10s40 0 60-10v70H0V40z' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M0 60c15-8 30 2 45-6s30 2 45-6v46H0V60z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Header Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-6">
          <h1 className="text-4xl font-bold text-center mb-2 drop-shadow-lg">
            {getGreeting()}, {user?.displayName}
          </h1>
          <p className="text-xl text-center text-white/90 drop-shadow-md">
            Your personal command center for growth and achievement
          </p>
        </div>
        
        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent"></div>
      </div>


      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
            {getGreeting()}, {user?.displayName}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal command center for growth, focus, and achievement
          </p>
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
          {/* Goals Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">Goals</CardTitle>
                </div>
                <Link href="/goals">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {totalGoals === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground mb-4">Set your first goal and start achieving</p>
                  <Button onClick={() => setShowNewGoalModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals?.slice(0, 3).map((goal: any) => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          {goal.dueDate && (
                            <p className="text-sm text-muted-foreground">
                              Due {new Date(goal.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {goal.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </div>
                  ))}
                  {totalGoals > 3 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{totalGoals - 3} more goals
                    </p>
                  )}
                </div>
              )}
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

          {/* Vision Board Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">Vision Board</CardTitle>
                </div>
                <Link href="/vision">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-muted-foreground mb-4">Visualize your dreams and aspirations</p>
                <Link href="/vision">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Star className="w-4 h-4 mr-2" />
                    Create Vision
                  </Button>
                </Link>
              </div>
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