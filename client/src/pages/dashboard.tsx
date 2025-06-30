import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { HabitCard } from "@/components/habits/habit-card";
import { NewHabitModal } from "@/components/habits/new-habit-modal";
import { ReadingTimer } from "@/components/reading/reading-timer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-2">
            {getGreeting()}, {user?.displayName}
          </h2>
          <p className="text-muted-foreground">
            Let's make today count. Focus on who you want to become.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="reading">Read & Reflect</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-primary">My Goals</h3>
                  <Button
                    onClick={() => setShowNewGoalModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Goal</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">No goals yet. Create your first goal to get started!</p>
                        <Button onClick={() => setShowNewGoalModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Goal
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    goals.map((goal: any) => (
                      <GoalCard key={goal.id} goal={goal} onUpdate={refetchGoals} />
                    ))
                  )}
                </div>
              </div>

              {/* Goals Stats Sidebar */}
              <div>
                <Card className="p-6 mb-6">
                  <h4 className="font-semibold text-primary mb-4">This Week</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Goals Completed</span>
                      <span className="font-semibold text-accent">
                        {goals.filter((g: any) => g.completed).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Micro-Goals Done</span>
                      <span className="font-semibold text-accent">
                        {goals.reduce((acc: number, g: any) => acc + g.microGoals.filter((mg: any) => mg.completed).length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Success Rate</span>
                      <span className="font-semibold text-green-600">
                        {goals.length > 0 ? Math.round((goals.filter((g: any) => g.completed).length / goals.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-primary">Daily Habits</h3>
                  <Button
                    onClick={() => setShowNewHabitModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Habit</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {habits.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">No habits yet. Create your first habit to get started!</p>
                        <Button onClick={() => setShowNewHabitModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Habit
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    habits.map((habit: any) => (
                      <HabitCard key={habit.id} habit={habit} onUpdate={refetchHabits} />
                    ))
                  )}
                </div>
              </div>

              {/* Habits Stats Sidebar */}
              <div>
                <Card className="p-6 mb-6">
                  <h4 className="font-semibold text-primary mb-4">This Week</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Completion Rate</span>
                      <span className="font-semibold text-green-600">
                        {habits.length > 0 ? Math.round((habits.filter((h: any) => h.completedToday).length / habits.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Best Streak</span>
                      <span className="font-semibold text-accent">
                        {habits.length > 0 ? Math.max(...habits.map((h: any) => h.streak)) : 0} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Total Habits</span>
                      <span className="font-semibold text-primary">{habits.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reading Tab */}
          <TabsContent value="reading">
            <ReadingTimer readingSessions={readingSessions} />
          </TabsContent>
        </Tabs>
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
