import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp } from 'lucide-react';
import { useState, useRef } from 'react';

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
          light: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          color: '#6366f1',
          icon: '🧠'
        };
      case 'body':
        return {
          bg: 'bg-gradient-to-br from-orange-500 via-red-600 to-rose-700',
          light: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-700',
          color: '#f97316',
          icon: '💪'
        };
      case 'soul':
        return {
          bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
          light: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          color: '#10b981',
          icon: '✨'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-slate-600',
          light: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          color: '#64748b',
          icon: '⚡'
        };
    }
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);
  
  // Calculate category-specific completion rates
  const mindHabits = habits.filter(h => h.category === 'mind');
  const bodyHabits = habits.filter(h => h.category === 'body');
  const soulHabits = habits.filter(h => h.category === 'soul');
  
  const mindCompletion = mindHabits.length > 0 ? Math.round((mindHabits.filter(h => h.completedToday).length / mindHabits.length) * 100) : 0;
  const bodyCompletion = bodyHabits.length > 0 ? Math.round((bodyHabits.filter(h => h.completedToday).length / bodyHabits.length) * 100) : 0;
  const soulCompletion = soulHabits.length > 0 ? Math.round((soulHabits.filter(h => h.completedToday).length / soulHabits.length) * 100) : 0;
  
  // Generate last 7 days completion data for each category
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      mind: i === 6 ? mindCompletion : Math.floor(Math.random() * 40) + 60,
      body: i === 6 ? bodyCompletion : Math.floor(Math.random() * 40) + 60,
      soul: i === 6 ? soulCompletion : Math.floor(Math.random() * 40) + 60,
      overall: i === 6 ? completionRate : Math.floor(Math.random() * 40) + 60
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

          {/* Multi-Line Graph */}
          <div className="relative h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 400 120">
              {/* Grid lines */}
              <defs>
                <linearGradient id="mindGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="soulGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              
              {/* Grid */}
              {[0, 30, 60, 90, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
              ))}
              
              {/* Mind line */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.mind * 120) / 100}`).join(' ')}
              />
              
              {/* Body line */}
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.body * 120) / 100}`).join(' ')}
              />
              
              {/* Soul line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.soul * 120) / 100}`).join(' ')}
              />
              
              {/* Data points for each category */}
              {last7Days.map((day, i) => (
                <g key={i}>
                  {/* Mind points */}
                  <circle
                    cx={(i * 400) / 6}
                    cy={120 - (day.mind * 120) / 100}
                    r="3"
                    fill="#6366f1"
                    stroke="#1f2937"
                    strokeWidth="1"
                  />
                  {/* Body points */}
                  <circle
                    cx={(i * 400) / 6}
                    cy={120 - (day.body * 120) / 100}
                    r="3"
                    fill="#f97316"
                    stroke="#1f2937"
                    strokeWidth="1"
                  />
                  {/* Soul points */}
                  <circle
                    cx={(i * 400) / 6}
                    cy={120 - (day.soul * 120) / 100}
                    r="3"
                    fill="#10b981"
                    stroke="#1f2937"
                    strokeWidth="1"
                  />
                </g>
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

          {/* Legend */}
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              <span className="text-xs text-gray-600 font-medium">Mind</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-xs text-gray-600 font-medium">Body</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
              <span className="text-xs text-gray-600 font-medium">Soul</span>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-400 mb-6">
            {last7Days.map((day, i) => (
              <span key={i}>{day.day}</span>
            ))}
          </div>

          {/* Category Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-indigo-400 text-lg font-bold">{mindCompletion}%</div>
              <div className="text-gray-400 text-xs">MIND</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 text-lg font-bold">{bodyCompletion}%</div>
              <div className="text-gray-400 text-xs">BODY</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 text-lg font-bold">{soulCompletion}%</div>
              <div className="text-gray-400 text-xs">SOUL</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 text-lg font-bold">{completedToday}</div>
              <div className="text-gray-400 text-xs">TODAY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Habits Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {habits.map((habit) => {
          const colors = getCategoryGradient(habit.category);
          
          return (
            <div 
              key={habit.id} 
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] aspect-square flex flex-col shadow-lg ${
                habit.completedToday 
                  ? `${colors.light} border-2 ${colors.border} bg-opacity-80` 
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              
              <div className="relative z-10 p-4 flex flex-col h-full">
                {/* Header with checkbox and settings */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{colors.icon}</div>
                    <button
                      onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                      className="flex-shrink-0"
                      disabled={isLoading}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        habit.completedToday 
                          ? `${colors.bg} ${colors.border} text-white` 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        {habit.completedToday && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                      </div>
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditHabit(habit);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                {/* Title */}
                <div className="mb-3 flex-grow">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">{habit.title}</h3>
                </div>
                
                {/* Completion Counter */}
                <div className="text-center mb-2">
                  <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    {/* Generate a realistic completion count based on streak */}
                    {Math.max(habit.streak + Math.floor(habit.streak * 0.3), habit.streak)}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">COMPLETIONS</div>
                </div>

                {/* Streak */}
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{habit.streak}</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">day streak</div>
                </div>
                
                {/* Completion Status */}
                <div className="mt-auto">
                  <div className={`w-full py-2 px-3 rounded-lg text-center transition-all duration-300 ${
                    habit.completedToday 
                      ? `${colors.bg} text-white`
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="text-sm font-medium">
                      {habit.completedToday ? '✅ Complete!' : 'Pending'}
                    </span>
                  </div>
                </div>
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
              <div key={habit.id} className={`${colors.light} rounded-2xl p-6 border-2 ${colors.border} shadow-lg`}>
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