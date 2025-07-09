import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Habit {
  id: number;
  title: string;
  category: string;
  streak: number;
  completedToday: boolean;
}

interface HabitProgressBarProps {
  habits: Habit[];
}

export function HabitProgressBar({ habits }: HabitProgressBarProps) {
  const habitsByCategory = {
    mind: habits.filter(h => h.category === 'mind'),
    body: habits.filter(h => h.category === 'body'),
    soul: habits.filter(h => h.category === 'soul')
  };

  const getCategoryProgress = (categoryHabits: Habit[]) => {
    if (categoryHabits.length === 0) return 0;
    return categoryHabits.reduce((total, habit) => total + habit.streak, 0) / categoryHabits.length;
  };

  const getFormationStage = (streak: number) => {
    if (streak >= 67) return { stage: "Mastered", color: "bg-yellow-400", textColor: "text-yellow-700" };
    if (streak >= 45) return { stage: "Automaticity", color: "bg-green-400", textColor: "text-green-700" };
    if (streak >= 21) return { stage: "Strengthening", color: "bg-blue-400", textColor: "text-blue-700" };
    if (streak >= 7) return { stage: "Initial", color: "bg-purple-400", textColor: "text-purple-700" };
    return { stage: "Starting", color: "bg-gray-400", textColor: "text-gray-700" };
  };

  const categories = [
    { 
      name: "Mind", 
      key: "mind" as const, 
      color: "bg-blue-500", 
      lightColor: "bg-blue-100",
      textColor: "text-blue-700",
      icon: "🧠"
    },
    { 
      name: "Body", 
      key: "body" as const, 
      color: "bg-orange-500", 
      lightColor: "bg-orange-100",
      textColor: "text-orange-700",
      icon: "💪"
    },
    { 
      name: "Soul", 
      key: "soul" as const, 
      color: "bg-emerald-500", 
      lightColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      icon: "✨"
    }
  ];

  const totalHabits = habits.length;
  const averageProgress = totalHabits > 0 
    ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / totalHabits) 
    : 0;

  return (
    <Card className="border-0 shadow-lg mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">67-Day Formation Progress</CardTitle>
        <p className="text-sm text-gray-600">Track your habit formation journey across all categories</p>
      </CardHeader>
      <CardContent>
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{averageProgress}/67 days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((averageProgress / 67) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start</span>
            <span>21 days</span>
            <span>45 days</span>
            <span>67 days</span>
          </div>
        </div>

        {/* Category Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryHabits = habitsByCategory[category.key];
            const avgProgress = getCategoryProgress(categoryHabits);
            const progressPercent = Math.min((avgProgress / 67) * 100, 100);
            
            return (
              <div key={category.key} className={`${category.lightColor} rounded-lg p-4 border border-gray-200`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {categoryHabits.length} habits
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Avg: {Math.round(avgProgress)}/67</span>
                    <span className={`font-bold ${category.textColor}`}>
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-white rounded-full h-2 mb-3">
                  <div 
                    className={`${category.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Category Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      {categoryHabits.filter(h => h.streak >= 21).length}
                    </div>
                    <div className="text-gray-600">Forming</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">
                      {categoryHabits.filter(h => h.streak >= 67).length}
                    </div>
                    <div className="text-gray-600">Mastered</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formation Stages Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Formation Stages</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Starting (0-6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Initial (7-20)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Strengthening (21-44)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Automaticity (45-66)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Mastered (67+)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}