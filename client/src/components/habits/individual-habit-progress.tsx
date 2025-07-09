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
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Habit Progress</CardTitle>
          <p className="text-sm text-gray-600">Your habit progress bars will appear here</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No habits created yet. Add your first habit to start tracking progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Habit Progress</CardTitle>
        <p className="text-sm text-gray-600">Track each habit's journey to 67-day mastery</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map((habit) => {
            const progressPercent = getProgressPercentage(habit.streak);
            const categoryColor = getCategoryColor(habit.category);
            
            return (
              <div key={habit.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${categoryColor}`}></div>
                    <span className="font-medium text-gray-900 text-sm">{habit.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{habit.streak}/67</span>
                    <span className="text-xs font-bold text-gray-900">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${categoryColor} h-2 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  
                  {/* Formation milestones */}
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                    <span>0</span>
                    <span>21</span>
                    <span>45</span>
                    <span>67</span>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {habit.streak >= 67 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        ✨ Mastered
                      </span>
                    )}
                    {habit.streak >= 45 && habit.streak < 67 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        🎯 Automaticity
                      </span>
                    )}
                    {habit.streak >= 21 && habit.streak < 45 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        💪 Strengthening
                      </span>
                    )}
                    {habit.streak >= 7 && habit.streak < 21 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        🌱 Initial
                      </span>
                    )}
                    {habit.streak < 7 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        🚀 Starting
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {habit.completedToday ? (
                      <span className="text-xs text-green-600">✓ Done today</span>
                    ) : (
                      <span className="text-xs text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {habits.filter(h => h.category === 'mind').length}
              </div>
              <div className="text-xs text-gray-600">Mind</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {habits.filter(h => h.category === 'body').length}
              </div>
              <div className="text-xs text-gray-600">Body</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">
                {habits.filter(h => h.category === 'soul').length}
              </div>
              <div className="text-xs text-gray-600">Soul</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}