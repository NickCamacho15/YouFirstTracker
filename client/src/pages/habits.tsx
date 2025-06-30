import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitStoryBar } from "@/components/habits/habit-story-bar";
import { NewHabitModal } from "@/components/habits/new-habit-modal";
import { Plus, Zap } from "lucide-react";

interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
  reasons?: string[];
  category?: string;
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

        {/* Habits Grid */}
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(habits as Habit[]).map((habit) => (
                <HabitCard key={habit.id} habit={habit} onUpdate={refreshHabits} />
              ))}
            </div>
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