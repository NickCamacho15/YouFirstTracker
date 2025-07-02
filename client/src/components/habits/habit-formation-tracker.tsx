import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Brain, Zap, Trophy } from "lucide-react";

interface Habit {
  id: number;
  title: string;
  streak: number;
  category?: string;
  completedToday: boolean;
}

interface HabitFormationTrackerProps {
  habits: Habit[];
}

export function HabitFormationTracker({ habits }: HabitFormationTrackerProps) {
  // Filter habits that are in formation (streak < 67 days)
  const formationHabits = habits.filter(h => h.streak < 67);
  
  if (formationHabits.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">All Habits Mastered!</h3>
          <p className="text-muted-foreground">
            Congratulations! All your habits have reached the 67-day mastery milestone.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Formation Progress Tracker</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your habits through the three stages of formation
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {formationHabits.map((habit) => {
            const stage = habit.streak <= 18 ? 1 : habit.streak <= 45 ? 2 : 3;
            const stageProgress = stage === 1 
              ? (habit.streak / 18) * 100 
              : stage === 2 
              ? ((habit.streak - 18) / 27) * 100 
              : ((habit.streak - 45) / 22) * 100;

            const stageColors = {
              1: 'text-blue-600',
              2: 'text-orange-600', 
              3: 'text-emerald-600'
            };

            return (
              <div key={habit.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{habit.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={stageColors[stage as keyof typeof stageColors]}>
                        Stage {stage}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Day {habit.streak}/67
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {habit.streak}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(habit.streak / 67) * 100}%` }}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round((habit.streak / 67) * 100)}% to mastery
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}