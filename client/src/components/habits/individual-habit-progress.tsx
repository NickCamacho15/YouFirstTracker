import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Habit {
  id: number;
  title: string;
  category: string;
  streak: number;
  completedToday: boolean;
}

interface IndividualHabitProgressProps {
  habits: Habit[];
}

export function IndividualHabitProgress({ habits }: IndividualHabitProgressProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mind': return 'bg-blue-500';
      case 'body': return 'bg-orange-500';
      case 'soul': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (streak: number) => {
    return Math.min((streak / 67) * 100, 100);
  };

  if (habits.length === 0) {
    return (
      <Card className="border-0 shadow-lg mb-4">
        <CardHeader className="pb-2">
          <div className="grid grid-cols-3 gap-4 text-center mb-2">
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-600">Mind</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-xs text-gray-600">Body</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">0</div>
              <div className="text-xs text-gray-600">Soul</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No habits created yet. Add your first habit to start tracking progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg mb-4">
      <CardHeader className="pb-2">
        {/* Summary numbers at top */}
        <div className="grid grid-cols-3 gap-4 text-center mb-2">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {habits.filter(h => h.category === 'mind').length}
            </div>
            <div className="text-xs text-gray-600">Mind</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {habits.filter(h => h.category === 'body').length}
            </div>
            <div className="text-xs text-gray-600">Body</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {habits.filter(h => h.category === 'soul').length}
            </div>
            <div className="text-xs text-gray-600">Soul</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Compact stacked progress bars */}
        <div className="space-y-1.5">
          {habits.map((habit) => {
            const progressPercent = getProgressPercentage(habit.streak);
            const categoryColor = getCategoryColor(habit.category);
            
            return (
              <div key={habit.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${categoryColor}`}></div>
                    <span className="font-medium text-gray-900 text-xs truncate">{habit.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-900">{habit.streak}/67</span>
                    {habit.completedToday && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`${categoryColor} h-1.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}