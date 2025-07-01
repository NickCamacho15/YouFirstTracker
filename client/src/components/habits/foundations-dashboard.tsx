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
          bg: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600',
          light: 'from-blue-50 via-indigo-50 to-purple-50',
          dark: 'from-blue-950/30 via-indigo-950/30 to-purple-950/30',
          glow: 'shadow-blue-500/25',
          border: 'border-blue-200',
          text: 'text-blue-600',
          icon: '🧠'
        };
      case 'body':
        return {
          bg: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-600',
          light: 'from-orange-50 via-red-50 to-pink-50',
          dark: 'from-orange-950/30 via-red-950/30 to-pink-950/30',
          glow: 'shadow-orange-500/25',
          border: 'border-orange-200',
          text: 'text-orange-600',
          icon: '💪'
        };
      case 'soul':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600',
          light: 'from-emerald-50 via-teal-50 to-cyan-50',
          dark: 'from-emerald-950/30 via-teal-950/30 to-cyan-950/30',
          glow: 'shadow-emerald-500/25',
          border: 'border-emerald-200',
          text: 'text-emerald-600',
          icon: '✨'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          light: 'from-gray-50 to-gray-50',
          dark: 'from-gray-950/30 to-gray-950/30',
          glow: 'shadow-gray-500/25',
          border: 'border-gray-200',
          text: 'text-gray-600',
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
      <div className="grid gap-4">
        {habits.map((habit) => {
          const colors = getCategoryGradient(habit.category);
          const streakWidth = maxStreak > 0 ? (habit.streak / maxStreak) * 100 : 0;
          
          return (
            <div key={habit.id} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.light} dark:bg-gradient-to-br dark:${colors.dark} border ${colors.border} dark:border-opacity-50 hover:shadow-xl hover:${colors.glow} transition-all duration-300 hover:scale-[1.02]`}>
              {/* Animated background gradient */}
              <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{colors.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{habit.title}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{habit.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Enhanced streak visualization */}
                    <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-3 py-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors.bg} transition-all duration-500`}
                          style={{ width: `${streakWidth}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{habit.streak}</span>
                    </div>
                    
                    {/* Interactive edit button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditHabit(habit)}
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