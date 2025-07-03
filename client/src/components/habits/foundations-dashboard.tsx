import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp, X } from 'lucide-react';
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
  const [showTip, setShowTip] = useState(true);
  const [showScience, setShowScience] = useState(true);
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
  
  // Calculate fitness-style metrics
  const totalHabits = habits.length;
  const avgStreak = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  
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
    <div className="space-y-8">
      {/* Foundation Monitor - Direct Page Integration */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-emerald-500/8 to-teal-500/8 rounded-full blur-2xl"></div>
        </div>
        
        {/* Long-term Consistency Dashboard */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black mb-2">FOUNDATION CONSISTENCY</h1>
              <p className="text-gray-300">Long-term personal investment tracking</p>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-bold tracking-wide">CONSISTENCY RATE</div>
              <div className="text-5xl font-black text-white">{completionRate}</div>
              <div className="text-green-400 text-sm">EXCELLENT</div>
            </div>
          </div>
          
          {/* Long-term Metrics Row */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-yellow-400 text-2xl font-black">{totalHabits}</div>
              <div className="text-gray-300 text-xs font-medium">FOUNDATIONS</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-red-400 text-2xl font-black">{longestStreak}</div>
              <div className="text-gray-300 text-xs font-medium">LONGEST</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-blue-400 text-2xl font-black">{completedToday}</div>
              <div className="text-gray-300 text-xs font-medium">TODAY</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-purple-400 text-2xl font-black">
                {habits.length > 0 ? Math.round((habits.reduce((sum, h) => sum + Math.min(h.streak, 365), 0) / habits.length) * 100 / 365) : 0}%
              </div>
              <div className="text-gray-300 text-xs font-medium">YEAR PROGRESS</div>
            </div>
          </div>
        </div>

        {/* Fitness-Style Performance Graph */}
        <div className="bg-black rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-bold">7-DAY STRAIN</h3>
            <div className="text-green-400 text-sm font-medium">RECOVERY ZONE</div>
          </div>
          
          <div className="relative h-40">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              {/* Heart rate zone backgrounds */}
              <rect x="0" y="0" width="400" height="32" fill="#ef4444" opacity="0.1"/>
              <rect x="0" y="32" width="400" height="32" fill="#f97316" opacity="0.1"/>
              <rect x="0" y="64" width="400" height="32" fill="#eab308" opacity="0.1"/>
              <rect x="0" y="96" width="400" height="32" fill="#22c55e" opacity="0.1"/>
              <rect x="0" y="128" width="400" height="32" fill="#06b6d4" opacity="0.1"/>
              
              {/* Grid lines */}
              {[0, 32, 64, 96, 128, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#374151" strokeWidth="0.5"/>
              ))}
              
              {/* Strain area fill */}
              <path
                fill="url(#strainGradient)"
                d={`M 0,160 ${last7Days.map((day, i) => `L ${(i * 400) / 6},${160 - (day.overall * 160) / 100}`).join(' ')} L 400,160 Z`}
                opacity="0.3"
              />
              
              {/* Main strain line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${160 - (day.overall * 160) / 100}`).join(' ')}
              />
              
              {/* Data points */}
              {last7Days.map((day, i) => (
                <circle
                  key={i}
                  cx={(i * 400) / 6}
                  cy={160 - (day.overall * 160) / 100}
                  r="4"
                  fill="#10b981"
                  stroke="#000"
                  strokeWidth="2"
                />
              ))}
              
              <defs>
                <linearGradient id="strainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Zone labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-16">
              <span className="text-red-400">MAX</span>
              <span className="text-orange-400">HIGH</span>
              <span className="text-yellow-400">MOD</span>
              <span className="text-green-400">LOW</span>
              <span className="text-cyan-400">REST</span>
            </div>
          </div>
          
          {/* Day labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            {last7Days.map((day, i) => (
              <span key={i} className="text-center">{day.day}</span>
            ))}
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
        </div>

        {/* Category Stats Row */}
        <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6">
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

        {/* Long-term Foundation Categories */}
        {['mind', 'body', 'soul'].map((category) => {
          const categoryHabits = habits.filter(h => h.category === category);
          if (categoryHabits.length === 0) return null;
          
          const categoryConfig = {
            mind: { 
              name: 'Mind', 
              icon: '🧠', 
              color: 'bg-purple-500',
              lightColor: 'bg-purple-50',
              textColor: 'text-purple-600',
              borderColor: 'border-purple-200'
            },
            body: { 
              name: 'Body', 
              icon: '💪', 
              color: 'bg-orange-500',
              lightColor: 'bg-orange-50', 
              textColor: 'text-orange-600',
              borderColor: 'border-orange-200'
            },
            soul: { 
              name: 'Soul', 
              icon: '✨', 
              color: 'bg-emerald-500',
              lightColor: 'bg-emerald-50',
              textColor: 'text-emerald-600',
              borderColor: 'border-emerald-200'
            }
          }[category];
          
          const categoryConsistency = categoryHabits.length > 0 
            ? Math.round((categoryHabits.filter(h => h.completedToday).length / categoryHabits.length) * 100)
            : 0;
          
          return (
            <div key={category} className={`${categoryConfig.lightColor} ${categoryConfig.borderColor} border-2 rounded-3xl p-6 mb-6`}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${categoryConfig.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl">{categoryConfig.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{categoryConfig.name}</h3>
                    <p className="text-gray-600">{categoryHabits.length} foundation{categoryHabits.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                {/* Category Consistency Score */}
                <div className="text-right">
                  <div className={`${categoryConfig.textColor} text-sm font-bold`}>CONSISTENCY</div>
                  <div className="text-3xl font-black text-gray-900">{categoryConsistency}%</div>
                  <div className="text-xs text-gray-600">TODAY</div>
                </div>
              </div>
              
              {/* Foundation Items within Category */}
              <div className="space-y-3">
                {categoryHabits.map((habit) => (
                  <div key={habit.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Simple Completion Circle */}
                        <button
                          onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                            habit.completedToday 
                              ? `${categoryConfig.color} border-transparent`
                              : `border-gray-300 hover:${categoryConfig.borderColor}`
                          }`}
                        >
                          {habit.completedToday && (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Habit Details */}
                        <div>
                          <h4 className="font-semibold text-gray-900">{habit.title}</h4>
                          <p className="text-sm text-gray-600">
                            {habit.streak} day streak • 
                            {habit.streak >= 365 ? ' Yearly Master' : 
                             habit.streak >= 100 ? ' Century Club' : 
                             habit.streak >= 30 ? ' Monthly Champion' : 
                             habit.streak >= 7 ? ' Weekly Winner' : ' Building...'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Long-term Progress & Edit */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${categoryConfig.textColor}`}>
                            {Math.round((habit.streak / 365) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">YEAR</div>
                        </div>
                        
                        <button 
                          onClick={() => onEditHabit(habit)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
            >
              {/* Large Progress Circle */}
              <div className="flex flex-col items-center mb-3 flex-shrink-0">
                <div className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-colors duration-300 ${
                  habit.completedToday 
                    ? 'border-white/30 bg-white/10' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  {/* Progress fill */}
                  <div className={`absolute inset-1 rounded-full transition-colors duration-300 ${
                    habit.completedToday 
                      ? 'bg-white/20' 
                      : 'bg-transparent'
                  }`} />
                  
                  {/* Icon */}
                  <div className={`text-xl z-10 transition-colors duration-300 ${
                    habit.completedToday ? 'text-white' : 'text-gray-600'
                  }`}>
                    {habit.completedToday ? '✓' : colors.icon}
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <h4 className={`font-bold text-sm leading-tight text-center mb-2 flex-shrink-0 ${
                habit.completedToday ? 'text-white' : 'text-gray-800'
              }`}>
                {habit.title}
              </h4>
              
              {/* Completion status */}
              <div className={`text-xs font-medium text-center mb-3 flex-shrink-0 ${
                habit.completedToday ? 'text-white/80' : 'text-gray-500'
              }`}>
                {habit.completedToday ? 'Complete' : 'Tap to complete'}
              </div>
              
              {/* Live Progress Bar Graph */}
              <div className="mt-auto w-full flex-shrink-0">
                <div className="flex items-end justify-center gap-1 h-6 mb-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    // Simulate last 7 days of completion (in real app, this would come from habit logs)
                    const isCompleted = Math.random() > 0.3; // Random for demo
                    const isToday = i === 6;
                    
                    return (
                      <div
                        key={i}
                        className={`w-2 rounded-sm transition-colors duration-300 ${
                          isToday && habit.completedToday
                            ? 'bg-white/80 h-full'
                            : isCompleted
                            ? habit.completedToday 
                              ? 'bg-white/50 h-4' 
                              : 'bg-blue-500 h-4'
                            : habit.completedToday
                            ? 'bg-white/20 h-1'
                            : 'bg-gray-300 h-1'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className={`text-xs text-center font-medium ${
                  habit.completedToday ? 'text-white/70' : 'text-gray-500'
                }`}>
                  7 day streak
                </div>
              </div>
              
              {/* Streak indicator */}
              {habit.streak > 0 && (
                <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  habit.completedToday 
                    ? 'bg-white/20 text-white' 
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  🔥 {habit.streak}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Habit Performance Radar Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Performance Overview
        </h3>
        
        <div className="flex flex-col items-center">
          {/* Radar Chart */}
          <div className="relative w-96 h-96 md:w-[500px] md:h-[500px] mb-8">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Background circles for progress levels */}
              {[20, 40, 60, 80, 100].map((level, index) => (
                <circle
                  key={level}
                  cx="200"
                  cy="200"
                  r={level * 1.5}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity={0.3}
                />
              ))}
              
              {/* Grid lines from center */}
              {habits.map((_, index) => {
                const angle = (index * 360) / habits.length;
                const x2 = 200 + 150 * Math.cos((angle - 90) * Math.PI / 180);
                const y2 = 200 + 150 * Math.sin((angle - 90) * Math.PI / 180);
                
                return (
                  <line
                    key={`grid-${index}`}
                    x1="200"
                    y1="200"
                    x2={x2}
                    y2={y2}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    opacity={0.3}
                  />
                );
              })}
              
              {/* Habit progress areas */}
              {habits.map((habit, index) => {
                const colors = getCategoryGradient(habit.category);
                const progressValue = Math.min((habit.streak / 67) * 150, 150);
                const angle = (index * 360) / habits.length;
                const x = 200 + progressValue * Math.cos((angle - 90) * Math.PI / 180);
                const y = 200 + progressValue * Math.sin((angle - 90) * Math.PI / 180);
                
                return (
                  <g key={`habit-${habit.id}`}>
                    {/* Habit progress point - larger and more engaging */}
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill={colors.bg.includes('blue') ? '#3b82f6' : 
                           colors.bg.includes('purple') ? '#8b5cf6' :
                           colors.bg.includes('emerald') ? '#10b981' :
                           colors.bg.includes('amber') ? '#f59e0b' : '#ef4444'}
                      stroke="white"
                      strokeWidth="4"
                      className="drop-shadow-lg animate-pulse"
                    />
                    
                    {/* Inner glow effect */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={colors.bg.includes('blue') ? '#60a5fa' : 
                           colors.bg.includes('purple') ? '#a78bfa' :
                           colors.bg.includes('emerald') ? '#34d399' :
                           colors.bg.includes('amber') ? '#fbbf24' : '#f87171'}
                      opacity="0.6"
                    />
                    
                    {/* Habit icon */}
                    <text
                      x={200 + (progressValue + 25) * Math.cos((angle - 90) * Math.PI / 180)}
                      y={200 + (progressValue + 25) * Math.sin((angle - 90) * Math.PI / 180)}
                      textAnchor="middle"
                      fontSize="16"
                      fill="#374151"
                    >
                      {colors.icon}
                    </text>
                    
                    {/* Habit label */}
                    <text
                      x={200 + (progressValue + 45) * Math.cos((angle - 90) * Math.PI / 180)}
                      y={200 + (progressValue + 45) * Math.sin((angle - 90) * Math.PI / 180)}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                      className="font-semibold"
                    >
                      {habit.title.split(' ')[0]}
                    </text>
                    
                    {/* Progress value */}
                    <text
                      x={200 + (progressValue + 60) * Math.cos((angle - 90) * Math.PI / 180)}
                      y={200 + (progressValue + 60) * Math.sin((angle - 90) * Math.PI / 180)}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                    >
                      {habit.streak}d
                    </text>
                  </g>
                );
              })}
              
              {/* Center completion indicator - larger and more prominent */}
              <circle
                cx="200"
                cy="200"
                r="45"
                fill="url(#centerGradient)"
                stroke="#3b82f6"
                strokeWidth="6"
                className="drop-shadow-xl"
              />
              
              {/* Center glow effect */}
              <circle
                cx="200"
                cy="200"
                r="35"
                fill="url(#centerInnerGradient)"
                opacity="0.8"
              />
              
              {/* Center text - larger and more prominent */}
              <text
                x="200"
                y="195"
                textAnchor="middle"
                fontSize="24"
                fill="white"
                className="font-black"
              >
                {habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) : 0}
              </text>
              <text
                x="200"
                y="215"
                textAnchor="middle"
                fontSize="12"
                fill="white"
                className="font-semibold"
              >
                avg days
              </text>
              
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </radialGradient>
                <radialGradient id="centerInnerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {habits.map((habit) => {
              const colors = getCategoryGradient(habit.category);
              const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
              
              return (
                <div key={`legend-${habit.id}`} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: colors.bg.includes('blue') ? '#3b82f6' : 
                                     colors.bg.includes('purple') ? '#8b5cf6' :
                                     colors.bg.includes('emerald') ? '#10b981' :
                                     colors.bg.includes('amber') ? '#f59e0b' : '#ef4444'
                    }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{habit.title}</div>
                    <div className="text-xs text-gray-500">{Math.round(progressPercentage)}% complete</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}