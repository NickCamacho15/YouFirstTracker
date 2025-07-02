import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp } from 'lucide-react';

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
          dark: 'from-blue-900/90 via-indigo-900/90 to-purple-900/90',
          glow: 'shadow-blue-500/40',
          border: 'border-blue-300',
          text: 'text-blue-700',
          color: '#6366f1',
          icon: '🧠'
        };
      case 'body':
        return {
          bg: 'bg-gradient-to-br from-orange-500 via-red-600 to-rose-700',
          light: 'from-orange-100 via-red-100 to-rose-100',
          dark: 'from-orange-900/90 via-red-900/90 to-rose-900/90',
          glow: 'shadow-orange-500/40',
          border: 'border-orange-300',
          text: 'text-orange-700',
          color: '#f97316',
          icon: '💪'
        };
      case 'soul':
        return {
          bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
          light: 'from-emerald-100 via-teal-100 to-cyan-100',
          dark: 'from-emerald-900/90 via-teal-900/90 to-cyan-900/90',
          glow: 'shadow-emerald-500/40',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          color: '#10b981',
          icon: '✨'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-slate-600',
          light: 'from-gray-100 to-slate-100',
          dark: 'from-gray-900/90 to-slate-900/90',
          glow: 'shadow-gray-500/40',
          border: 'border-gray-300',
          text: 'text-gray-700',
          color: '#64748b',
          icon: '⚡'
        };
    }
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);
  
  // Generate last 7 days completion data for the graph
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    // Mock completion rates for visualization
    const mockRate = Math.floor(Math.random() * 40) + 60; // 60-100%
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      completion: i === 6 ? completionRate : mockRate // Today's actual rate
    };
  });

  return (
    <div className="space-y-6">
      {/* Central Completion Graph - Whoop Style */}
      <div className="relative p-6 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-3xl border border-gray-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-lg animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">FOUNDATION MONITOR</h2>
              <p className="text-gray-400 text-sm">Last updated {new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 text-sm font-semibold">HIGH</div>
              <div className="text-white text-2xl font-bold">{completionRate}%</div>
            </div>
          </div>

          {/* Line Graph */}
          <div className="relative h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 400 120">
              {/* Grid lines */}
              <defs>
                <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              
              {/* Grid */}
              {[0, 30, 60, 90, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
              ))}
              
              {/* Data line */}
              <polyline
                fill="none"
                stroke="url(#graphGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.completion * 120) / 100}`).join(' ')}
              />
              
              {/* Data points */}
              {last7Days.map((day, i) => (
                <circle
                  key={i}
                  cx={(i * 400) / 6}
                  cy={120 - (day.completion * 120) / 100}
                  r="3"
                  fill="#10b981"
                  stroke="#1f2937"
                  strokeWidth="1"
                />
              ))}
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-400 mb-6">
            {last7Days.map((day, i) => (
              <span key={i}>{day.day}</span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-cyan-400 text-lg font-bold">{completedToday}</div>
              <div className="text-gray-400 text-xs">TODAY</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 text-lg font-bold">{Math.max(...habits.map(h => h.streak))}</div>
              <div className="text-gray-400 text-xs">MAX STREAK</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 text-lg font-bold">{habits.length}</div>
              <div className="text-gray-400 text-xs">TOTAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Habits Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {habits.map((habit) => {
          const colors = getCategoryGradient(habit.category);
          
          return (
            <div key={habit.id} className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-2 ${colors.border} hover:shadow-xl hover:${colors.glow} transition-all duration-300 hover:scale-[1.05] aspect-square flex flex-col shadow-lg`}>
              {/* Animated background gradient */}
              <div className={`absolute inset-0 ${colors.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 p-4 flex flex-col h-full">
                {/* Header with icon and settings */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{colors.icon}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditHabit(habit)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                {/* Title */}
                <div className="mb-3 flex-grow">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">{habit.title}</h3>
                </div>
                
                {/* Streak */}
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{habit.streak}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">days</div>
                </div>
                
                {/* Large Completion Button */}
                <Button
                  onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                  disabled={isLoading}
                  className={`w-full h-12 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 ${
                    habit.completedToday 
                      ? `${colors.bg} text-white hover:opacity-90 shadow-lg animate-pulse`
                      : `bg-gray-50 dark:bg-gray-800 border-2 ${colors.border} text-gray-700 dark:text-gray-300 hover:${colors.bg} hover:text-white hover:border-transparent`
                  }`}
                >
                  {habit.completedToday ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Development Period Graph */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          67-Day Formation Journey
        </h3>
        
        <div className="space-y-6">
          {habits.map((habit) => {
            const colors = getCategoryGradient(habit.category);
            const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
            
            // Determine stage
            let stage = '';
            let stageColor = '';
            if (habit.streak <= 18) {
              stage = 'Initial Formation';
              stageColor = 'text-blue-700';
            } else if (habit.streak <= 45) {
              stage = 'Strengthening';
              stageColor = 'text-amber-700';
            } else if (habit.streak <= 67) {
              stage = 'Automaticity';
              stageColor = 'text-emerald-700';
            } else {
              stage = 'Mastered';
              stageColor = 'text-purple-700';
            }
            
            return (
              <div key={habit.id} className={`bg-gradient-to-r ${colors.light} dark:bg-gradient-to-r dark:${colors.dark} rounded-2xl p-6 border-2 ${colors.border} shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{colors.icon}</div>
                    <div>
                      <h4 className="font-black text-xl text-gray-900 dark:text-gray-100">{habit.title}</h4>
                      <p className={`text-base ${stageColor} font-bold`}>{stage} • Day {habit.streak}/67</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-900 dark:text-gray-100">{Math.round(progressPercentage)}%</div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">complete</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className={`h-4 ${colors.bg} transition-all duration-1000 ease-out rounded-full relative shadow-lg`}
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-white/40"></div>
                  </div>
                </div>
                
                {/* Stage Markers */}
                <div className="flex justify-between mt-3 text-sm font-bold">
                  <span className={habit.streak > 18 ? 'text-blue-700 font-black' : 'text-gray-400'}>18</span>
                  <span className={habit.streak > 45 ? 'text-amber-700 font-black' : 'text-gray-400'}>45</span>
                  <span className={habit.streak >= 67 ? 'text-emerald-700 font-black' : 'text-gray-400'}>67</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}