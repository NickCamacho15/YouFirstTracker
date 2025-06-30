import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitStoryBar } from "@/components/habits/habit-story-bar";
import { HabitFormationTracker } from "@/components/habits/habit-formation-tracker";
import { NewHabitModal } from "@/components/habits/new-habit-modal";
import { Plus, Zap, BarChart3, Grid3X3 } from "lucide-react";

interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
  reasons?: string[];
  category?: string;
  timeOfDay?: string;
}

export default function HabitsPage() {
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["/api/habits"],
  });

  const refreshHabits = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
  };

  const handleAddHabit = () => {
    setShowNewHabitModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading your habits...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-8 h-8 text-accent" />
              Your Habits
            </h1>
            <p className="text-muted-foreground mt-2">
              Build consistency and track your daily progress
            </p>
          </div>
          <Button onClick={handleAddHabit} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>

        {/* Habit Stories */}
        {habits.length > 0 && (
          <div className="mb-8">
            <HabitStoryBar 
              habits={habits as Habit[]} 
              onUpdate={refreshHabits} 
              onAddHabit={handleAddHabit}
            />
          </div>
        )}

        {/* Habits Content */}
        <div className="space-y-6">
          {habits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Habits Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building powerful habits that will transform your life.
                  </p>
                  <Button onClick={handleAddHabit} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Habit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="formation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="formation" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Formation Tracker
                </TabsTrigger>
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Simple View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="formation" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Scientific Habit Formation</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Track your habits through the three scientifically-backed stages of formation. 
                    Research shows it takes an average of 66 days to form a new habit automatically.
                  </p>
                </div>
                <div className="space-y-8">
                  {(habits as Habit[]).map((habit) => (
                    <HabitFormationTracker key={habit.id} habit={habit} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="simple" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(habits as Habit[]).map((habit) => (
                    <Card key={habit.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">{habit.title}</h3>
                          <div className={`w-3 h-3 rounded-full ${
                            habit.category === 'mind' ? 'bg-purple-500' :
                            habit.category === 'body' ? 'bg-orange-500' :
                            habit.category === 'soul' ? 'bg-emerald-500' :
                            'bg-blue-500'
                          }`} />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Streak</span>
                            <span className="font-bold text-lg">{habit.streak} days</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Today</span>
                            <span className={`font-medium ${habit.completedToday ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {habit.completedToday ? 'Completed ✓' : 'Pending'}
                            </span>
                          </div>
                          
                          {habit.description && (
                            <p className="text-sm text-muted-foreground mt-2">{habit.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* New Habit Modal */}
        <NewHabitModal
          open={showNewHabitModal}
          onOpenChange={setShowNewHabitModal}
          onSuccess={refreshHabits}
        />
      </div>
    </div>
  );
}