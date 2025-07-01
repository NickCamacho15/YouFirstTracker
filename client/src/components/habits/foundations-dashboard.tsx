import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, Hash, Target, Sparkles } from 'lucide-react';

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
  if (habits.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-block">
          <div className="text-8xl mb-6 animate-pulse">🌱</div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
        </div>
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          No foundations yet
        </h3>
        <p className="text-muted-foreground text-lg">Create your first habit to begin building your foundations</p>
      </div>
    );
  }

  const getCategoryGradient = (category?: string) => {
    switch (category) {
      case 'mind':
        return {
          bg: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700',
          light: 'from-blue-100 via-indigo-100 to-purple-100',
          dark: 'from-blue-900/80 via-indigo-900/80 to-purple-900/80',
          glow: 'shadow-blue-500/40',
          border: 'border-blue-300',
          text: 'text-blue-700',
          icon: '🧠'
        };
      case 'body':
        return {
          bg: 'bg-gradient-to-br from-orange-500 via-red-600 to-rose-700',
          light: 'from-orange-100 via-red-100 to-rose-100',
          dark: 'from-orange-900/80 via-red-900/80 to-rose-900/80',
          glow: 'shadow-orange-500/40',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: '💪'
        };
      case 'soul':
        return {
          bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
          light: 'from-emerald-100 via-teal-100 to-cyan-100',
          dark: 'from-emerald-900/80 via-teal-900/80 to-cyan-900/80',
          glow: 'shadow-emerald-500/40',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          icon: '✨'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-slate-600',
          light: 'from-gray-100 to-slate-100',
          dark: 'from-gray-900/80 to-slate-900/80',
          glow: 'shadow-gray-500/40',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: '⚡'
        };
    }
  };

  const maxStreak = Math.max(...habits.map(h => h.streak));
  const completedToday = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);

  // Group habits by category
  const habitsByCategory = {
    mind: habits.filter(h => h.category === 'mind'),
    body: habits.filter(h => h.category === 'body'),
    soul: habits.filter(h => h.category === 'soul')
  };

  return (
    <div className="space-y-8">
      {/* Evolving Foundation Tree Visual */}
      <div className="relative p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-lg animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            🌳 Your Foundation Tree
          </h2>
          
          <div className="grid grid-cols-3 gap-8 mb-6">
            {Object.entries(habitsByCategory).map(([category, categoryHabits]) => {
              const colors = getCategoryGradient(category);
              const categoryStreak = categoryHabits.reduce((sum, h) => sum + h.streak, 0);
              const categoryCompletion = categoryHabits.filter(h => h.completedToday).length;
              
              return (
                <div key={category} className="text-center">
                  <div className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${colors.light} dark:bg-gradient-to-br dark:${colors.dark} border ${colors.border} dark:border-opacity-50 mb-3`}>
                    <div className="text-3xl mb-2">{colors.icon}</div>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {category}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${colors.text}`}>
                    {categoryHabits.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {categoryCompletion}/{categoryHabits.length} today
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="text-4xl font-black text-emerald-600 mb-2">{completionRate}%</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Foundation Strength</div>
          </div>
        </div>
      </div>

      {/* Interactive Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => {
          const colors = getCategoryGradient(habit.category);
          const streakWidth = maxStreak > 0 ? (habit.streak / maxStreak) * 100 : 0;
          
          return (
            <div key={habit.id} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.light} dark:bg-gradient-to-br dark:${colors.dark} border ${colors.border} dark:border-opacity-50 hover:shadow-xl hover:${colors.glow} transition-all duration-300 hover:scale-[1.02] min-h-[280px] flex flex-col`}>
              {/* Animated background gradient */}
              <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Header with icon and settings */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{colors.icon}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditHabit(habit)}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                {/* Title and description */}
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-2">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                  )}
                </div>
                
                {/* Streak visualization */}
                <div className="mb-6 flex-grow flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span className="text-3xl font-black text-gray-800 dark:text-gray-200">{habit.streak}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">day streak</div>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3 mx-auto">
                      <div 
                        className={`h-2 rounded-full ${colors.bg} transition-all duration-500`}
                        style={{ width: `${streakWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
                      className="h-10 w-10 p-0 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-110"
                    >
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                </div>
                
                {/* Large Interactive Completion Button */}
                <Button
                  onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                  disabled={isLoading}
                  className={`w-full h-14 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 transform-gpu ${
                    habit.completedToday 
                      ? `${colors.bg} text-white hover:opacity-90 ${colors.glow} shadow-lg animate-pulse`
                      : `bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 ${colors.border} dark:border-opacity-30 text-gray-700 dark:text-gray-300 hover:${colors.bg} hover:text-white hover:border-transparent`
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {habit.completedToday ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                        <span>Foundation Complete!</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Circle className="w-6 h-6" />
                          <div className={`absolute inset-0 w-6 h-6 border-2 ${colors.border} rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse`}></div>
                        </div>
                        <span>Build Foundation</span>
                        <div className={`w-2 h-2 ${colors.bg} rounded-full animate-ping opacity-75`}></div>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}