import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Settings, Flame } from 'lucide-react';

interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: string;
  streak: number;
  completedToday: boolean;
  category?: string;
  timeOfDay?: string;
}

interface FoundationsDashboardProps {
  habits: Habit[];
  onToggleHabit: (habitId: number, completed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  isLoading: boolean;
}

export function FoundationsDashboard({ habits, onToggleHabit, onEditHabit, isLoading }: FoundationsDashboardProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'mind': return { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-50' };
      case 'body': return { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', light: 'bg-orange-50' };
      case 'soul': return { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', light: 'bg-emerald-50' };
      default: return { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-50' };
    }
  };

  const getTimeOfDayEmoji = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '⏰';
    }
  };

  const getTimeOfDayLabel = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'evening': return 'Evening';
      case 'night': return 'Night';
      default: return 'Anytime';
    }
  };

  const maxStreak = Math.max(...habits.map(h => h.streak), 1);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-8">
        {/* Header with overall stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {habits.reduce((sum, habit) => sum + habit.streak, 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Days</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {habits.filter(habit => habit.completedToday).length}/{habits.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {Math.round((habits.filter(habit => habit.completedToday).length / habits.length) * 100) || 0}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Daily Success</p>
          </div>
        </div>

        {/* Habits List with Streak Visualization */}
        <div className="space-y-4">
          {habits.map((habit) => {
            const colors = getCategoryColor(habit.category);
            const streakWidth = maxStreak > 0 ? (habit.streak / maxStreak) * 100 : 0;
            
            return (
              <div key={habit.id} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                {/* Completion Checkbox */}
                <Button
                  onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                    habit.completedToday
                      ? `${colors.bg} border-current text-white shadow-lg`
                      : `border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
                  }`}
                >
                  {habit.completedToday ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </Button>

                {/* Habit Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {habit.title}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimeOfDayEmoji(habit.timeOfDay)} {getTimeOfDayLabel(habit.timeOfDay)}
                    </span>
                  </div>
                  
                  {/* Streak Visualization */}
                  <div className="relative">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${colors.bg} shadow-sm`}
                        style={{ width: `${streakWidth}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0</span>
                      <span className="font-medium">{habit.streak} days</span>
                      <span>{maxStreak}</span>
                    </div>
                  </div>
                </div>

                {/* Streak Display */}
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{habit.streak}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">day streak</p>
                </div>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditHabit(habit)}
                  className="w-8 h-8 p-0 opacity-60 hover:opacity-100"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Quick Stats at Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="text-center">
              <span className="block font-medium text-gray-900 dark:text-white">
                {Math.max(...habits.map(h => h.streak))}
              </span>
              <span>Longest Streak</span>
            </div>
            <div className="text-center">
              <span className="block font-medium text-gray-900 dark:text-white">
                {Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length) || 0}
              </span>
              <span>Avg Streak</span>
            </div>
            <div className="text-center">
              <span className="block font-medium text-gray-900 dark:text-white">
                {habits.length}
              </span>
              <span>Total Habits</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}