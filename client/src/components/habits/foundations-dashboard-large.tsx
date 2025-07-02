import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp } from 'lucide-react';
import { useState } from 'react';

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

  const completedToday = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);

  // Generate performance data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      mind: Math.floor(Math.random() * 40) + 60,
      body: Math.floor(Math.random() * 40) + 50,
      soul: Math.floor(Math.random() * 40) + 70,
      overall: Math.floor(Math.random() * 30) + 65
    };
  });

  // Super vibrant color schemes for large tiles
  const getLargeTileColors = (category?: string, completed?: boolean) => {
    if (completed) {
      switch (category) {
        case 'mind':
          return {
            bg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700',
            shadow: 'shadow-2xl shadow-purple-500/50',
            text: 'text-white',
            ring: '#8b5cf6',
            icon: '🧠',
            glow: 'bg-purple-400/30'
          };
        case 'body':
          return {
            bg: 'bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700',
            shadow: 'shadow-2xl shadow-pink-500/50',
            text: 'text-white',
            ring: '#ec4899',
            icon: '💪',
            glow: 'bg-pink-400/30'
          };
        case 'soul':
          return {
            bg: 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700',
            shadow: 'shadow-2xl shadow-emerald-500/50',
            text: 'text-white',
            ring: '#10b981',
            icon: '✨',
            glow: 'bg-emerald-400/30'
          };
        default:
          return {
            bg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-700',
            shadow: 'shadow-2xl shadow-orange-500/50',
            text: 'text-white',
            ring: '#f59e0b',
            icon: '⭐',
            glow: 'bg-orange-400/30'
          };
      }
    } else {
      // Bright, inviting uncompleted states
      switch (category) {
        case 'mind':
          return {
            bg: 'bg-gradient-to-br from-violet-200 via-purple-200 to-fuchsia-300',
            shadow: 'shadow-xl shadow-purple-300/40',
            text: 'text-violet-800',
            ring: '#8b5cf6',
            icon: '🧠',
            glow: 'bg-purple-200/40'
          };
        case 'body':
          return {
            bg: 'bg-gradient-to-br from-rose-200 via-pink-200 to-purple-300',
            shadow: 'shadow-xl shadow-pink-300/40',
            text: 'text-rose-800',
            ring: '#ec4899',
            icon: '💪',
            glow: 'bg-pink-200/40'
          };
        case 'soul':
          return {
            bg: 'bg-gradient-to-br from-emerald-200 via-green-200 to-teal-300',
            shadow: 'shadow-xl shadow-emerald-300/40',
            text: 'text-emerald-800',
            ring: '#10b981',
            icon: '✨',
            glow: 'bg-emerald-200/40'
          };
        default:
          return {
            bg: 'bg-gradient-to-br from-amber-200 via-orange-200 to-red-300',
            shadow: 'shadow-xl shadow-orange-300/40',
            text: 'text-amber-800',
            ring: '#f59e0b',
            icon: '⭐',
            glow: 'bg-orange-200/40'
          };
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Foundation Monitor - Direct Page Integration */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">FOUNDATION MONITOR</h2>
            <p className="text-gray-600">Real-time habit performance tracking</p>
          </div>
          <div className="text-right">
            <div className="text-emerald-600 text-sm font-semibold">PERFORMANCE</div>
            <div className="text-gray-900 text-3xl font-bold">{completionRate}%</div>
          </div>
        </div>

        {/* Large 30-Day Performance Chart - Transparent, directly on page */}
        <div className="relative h-80 mb-12 p-8 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-2xl">
          {/* Chart Title and Legend */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">30-Day Performance Trends</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-violet-500"></div>
                <span className="text-sm font-semibold text-gray-700">Mind</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                <span className="text-sm font-semibold text-gray-700">Body</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-semibold text-gray-700">Soul</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <span className="text-sm font-semibold text-gray-700">Overall</span>
              </div>
            </div>
          </div>
          
          <svg className="w-full h-full" viewBox="0 0 800 240">
            {/* Grid with labels */}
            {[0, 60, 120, 180, 240].map((y, index) => (
              <g key={y}>
                <line x1="60" y1={y} x2="740" y2={y} stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>
                <text x="45" y={y + 5} fontSize="12" fill="#6b7280" textAnchor="end">
                  {100 - (index * 25)}%
                </text>
              </g>
            ))}
            
            {/* Vertical grid lines with date labels */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = 60 + (i * 97);
              const date = new Date();
              date.setDate(date.getDate() - (28 - i * 4));
              return (
                <g key={i}>
                  <line x1={x} y1="0" x2={x} y2="240" stroke="#94a3b8" strokeWidth="1" opacity="0.2"/>
                  <text x={x} y="255" fontSize="10" fill="#6b7280" textAnchor="middle">
                    {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </text>
                </g>
              );
            })}
            
            {/* Performance data lines with 30 days */}
            {/* Mind performance */}
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={Array.from({ length: 30 }, (_, i) => {
                const x = 60 + (i * 680) / 29;
                const performance = 60 + Math.sin(i * 0.3) * 20 + Math.random() * 15;
                const y = 240 - (performance * 240) / 100;
                return `${x},${y}`;
              }).join(' ')}
              className="drop-shadow-lg"
            />
            
            {/* Body performance */}
            <polyline
              fill="none"
              stroke="#ec4899"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={Array.from({ length: 30 }, (_, i) => {
                const x = 60 + (i * 680) / 29;
                const performance = 55 + Math.cos(i * 0.25) * 25 + Math.random() * 10;
                const y = 240 - (performance * 240) / 100;
                return `${x},${y}`;
              }).join(' ')}
              className="drop-shadow-lg"
            />
            
            {/* Soul performance */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={Array.from({ length: 30 }, (_, i) => {
                const x = 60 + (i * 680) / 29;
                const performance = 70 + Math.sin(i * 0.4) * 15 + Math.random() * 12;
                const y = 240 - (performance * 240) / 100;
                return `${x},${y}`;
              }).join(' ')}
              className="drop-shadow-lg"
            />
            
            {/* Overall performance */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={Array.from({ length: 30 }, (_, i) => {
                const x = 60 + (i * 680) / 29;
                const performance = 65 + Math.sin(i * 0.2) * 18 + Math.random() * 8;
                const y = 240 - (performance * 240) / 100;
                return `${x},${y}`;
              }).join(' ')}
              className="drop-shadow-xl"
            />
            
            {/* Data points */}
            {Array.from({ length: 7 }, (_, i) => {
              const x = 60 + (i * 680) / 6;
              const mindY = 240 - ((60 + Math.sin(i * 4.3) * 20) * 240) / 100;
              const bodyY = 240 - ((55 + Math.cos(i * 3.6) * 25) * 240) / 100;
              const soulY = 240 - ((70 + Math.sin(i * 5.7) * 15) * 240) / 100;
              
              return (
                <g key={`points-${i}`}>
                  <circle cx={x} cy={mindY} r="6" fill="#8b5cf6" className="drop-shadow-md"/>
                  <circle cx={x} cy={bodyY} r="6" fill="#ec4899" className="drop-shadow-md"/>
                  <circle cx={x} cy={soulY} r="6" fill="#10b981" className="drop-shadow-md"/>
                </g>
              );
            })}
            
            {/* Chart labels */}
            <text x="400" y="20" fontSize="16" fill="#374151" textAnchor="middle" className="font-bold">
              Foundation Performance Analytics
            </text>
            <text x="400" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">
              Last 30 Days
            </text>
            <text x="20" y="130" fontSize="12" fill="#6b7280" textAnchor="middle" transform="rotate(-90, 20, 130)">
              Performance %
            </text>
          </svg>
          
          {/* Performance insights */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="text-sm">
              <div className="font-semibold text-gray-800 mb-2">Today's Insights</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-600">Soul habits strongest (+15%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  <span className="text-xs text-gray-600">Mind consistency improving</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-xs text-gray-600">Body needs attention</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category-Based Habit Layout */}
      <div className="space-y-8 mb-8">
        {['mind', 'body', 'soul'].map((category) => {
          const categoryHabits = habits.filter(habit => 
            habit.category?.toLowerCase() === category
          );
          
          if (categoryHabits.length === 0) return null;
          
          const categoryConfigs = {
            mind: { 
              icon: '🧠', 
              label: 'Mind', 
              color: 'from-violet-500 to-purple-600',
              textColor: 'text-violet-700'
            },
            body: { 
              icon: '💪', 
              label: 'Body', 
              color: 'from-orange-500 to-red-600',
              textColor: 'text-orange-700'
            },
            soul: { 
              icon: '✨', 
              label: 'Soul', 
              color: 'from-emerald-500 to-teal-600',
              textColor: 'text-emerald-700'
            }
          };
          
          const categoryConfig = categoryConfigs[category as keyof typeof categoryConfigs] || {
            icon: '⚡',
            label: 'Other',
            color: 'from-gray-500 to-gray-600',
            textColor: 'text-gray-700'
          };
          
          return (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${categoryConfig.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {categoryConfig.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${categoryConfig.textColor}`}>
                    {categoryConfig.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {categoryHabits.length} habit{categoryHabits.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Habit Tiles Row */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {categoryHabits.map((habit) => {
                  const colors = getLargeTileColors(habit.category, habit.completedToday);
                  const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
                  
                  return (
                    <div 
                      key={`category-${habit.id}`}
                      className="flex-shrink-0 w-32"
                    >
                      {/* Habit Title */}
                      <div className="text-center mb-3">
                        <h4 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2 leading-tight">
                          {habit.title}
                        </h4>
                        <div className="text-xs text-gray-600">
                          {habit.streak}/67 days
                        </div>
                      </div>
                      
                      {/* Clickable Tile */}
                      <div 
                        className={`relative rounded-xl p-3 transition-all duration-700 hover:scale-105 transform ${colors.bg} ${colors.shadow} border-0 cursor-pointer h-28 flex flex-col justify-center ${
                          habit.completedToday ? 'animate-pulse' : ''
                        }`}
                        onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                      >
                        {/* Enhanced glow effect */}
                        <div className={`absolute inset-0 ${colors.glow} rounded-xl blur-lg ${
                          habit.completedToday ? 'opacity-80 animate-pulse' : 'opacity-40'
                        } -z-10`}></div>
                        
                        {/* Celebration sparkles when completed */}
                        {habit.completedToday && (
                          <>
                            <div className="absolute top-1 right-1 text-sm animate-bounce">✨</div>
                            <div className="absolute top-2 left-1 text-xs animate-bounce delay-200">⭐</div>
                          </>
                        )}
                        
                        {/* Content */}
                        <div className="relative text-center">
                          {/* Progress Ring */}
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90 hover:scale-110 transition-transform duration-300">
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                stroke="currentColor"
                                strokeWidth="5"
                                fill="none"
                                className="text-white/30"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                stroke={colors.ring}
                                strokeWidth="5"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 26}`}
                                strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPercentage / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-700 drop-shadow-lg"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-lg font-black ${colors.text}`}>{habit.streak}</span>
                            </div>
                            
                            {/* Multiple pulse effects when completed */}
                            {habit.completedToday && (
                              <>
                                <div className="absolute inset-0 rounded-full bg-white/40 animate-ping"></div>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-pulse"></div>
                              </>
                            )}
                          </div>
                          
                          {/* Completion Status */}
                          <div className="flex justify-center">
                            {habit.completedToday ? (
                              <CheckCircle2 className={`w-5 h-5 ${colors.text} animate-bounce`} />
                            ) : (
                              <Circle className={`w-5 h-5 ${colors.text} opacity-60 hover:opacity-80 transition-opacity`} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditHabit(habit)}
                        className="w-full text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-1 mt-2"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formation Progress Mandala - Enhanced Visual */}
      <div className="relative mt-12 mb-8">
        <h3 className="text-2xl font-bold mb-8 text-center text-gray-900">
          🌸 Formation Progress Mandala 🌸
        </h3>
        
        <div className="flex flex-col items-center">
          {/* Mandala Visualization */}
          <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Background mandala rings */}
              {[60, 120, 180].map((radius, index) => (
                <g key={`ring-${index}`}>
                  <circle
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke="rgba(156, 163, 175, 0.2)"
                    strokeWidth="2"
                    className="animate-pulse"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  />
                  {/* Decorative petals */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <g key={`petal-${radius}-${angle}`} transform={`rotate(${angle} 200 200)`}>
                      <path
                        d={`M 200 ${200 - radius + 10} Q ${200 + 15} ${200 - radius} 200 ${200 - radius - 10} Q ${200 - 15} ${200 - radius} 200 ${200 - radius + 10}`}
                        fill="rgba(167, 139, 250, 0.1)"
                        className="animate-pulse"
                        style={{ animationDelay: `${(index + angle / 45) * 0.2}s` }}
                      />
                    </g>
                  ))}
                </g>
              ))}
              
              {/* Habit points on mandala */}
              {habits.map((habit, index) => {
                const angle = (index * 360) / habits.length;
                const radius = 60 + (habit.streak / 67) * 120; // Radius based on progress
                const x = 200 + radius * Math.cos((angle - 90) * Math.PI / 180);
                const y = 200 + radius * Math.sin((angle - 90) * Math.PI / 180);
                const colors = getLargeTileColors(habit.category, habit.completedToday);
                
                return (
                  <g key={`mandala-${habit.id}`}>
                    {/* Progress trail */}
                    <path
                      d={`M 200 140 Q ${200 + 30 * Math.cos((angle - 90) * Math.PI / 180)} ${200 + 30 * Math.sin((angle - 90) * Math.PI / 180)} ${x} ${y}`}
                      fill="none"
                      stroke={habit.completedToday ? colors.ring : 'rgba(156, 163, 175, 0.3)'}
                      strokeWidth="3"
                      className="transition-all duration-1000"
                    />
                    
                    {/* Habit node */}
                    <circle
                      cx={x}
                      cy={y}
                      r={habit.completedToday ? "12" : "8"}
                      fill={habit.completedToday ? colors.ring : 'rgba(156, 163, 175, 0.6)'}
                      className={`transition-all duration-500 ${habit.completedToday ? 'animate-pulse' : ''}`}
                    />
                    
                    {/* Streak number */}
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white"
                    >
                      {habit.streak}
                    </text>
                    
                    {/* Habit label */}
                    <text
                      x={x}
                      y={y + 25}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-gray-700"
                    >
                      {habit.title.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
              
              {/* Center completion indicator */}
              <circle
                cx="200"
                cy="200"
                r="30"
                fill="url(#centerGradient)"
                className="animate-pulse"
              />
              
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{ stopColor: 'rgba(99, 102, 241, 0.8)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(139, 92, 246, 0.4)' }} />
                </radialGradient>
              </defs>
              
              {/* Center completion percentage */}
              <text
                x="200"
                y="195"
                textAnchor="middle"
                className="text-sm font-bold fill-white"
              >
                {Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100)}%
              </text>
              <text
                x="200"
                y="210"
                textAnchor="middle"
                className="text-xs font-medium fill-white opacity-80"
              >
                Today
              </text>
            </svg>
          </div>
          
          {/* Side Bar Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {['mind', 'body', 'soul'].map((category) => {
              const categoryHabits = habits.filter(h => h.category?.toLowerCase() === category);
              const avgStreak = categoryHabits.length > 0 ? 
                categoryHabits.reduce((sum, h) => sum + h.streak, 0) / categoryHabits.length : 0;
              const completionRate = categoryHabits.length > 0 ?
                (categoryHabits.filter(h => h.completedToday).length / categoryHabits.length) * 100 : 0;
              
              const categoryConfigs = {
                mind: { 
                  icon: '🧠', 
                  label: 'Mind', 
                  color: 'from-violet-500 to-purple-600',
                  bgColor: 'bg-violet-100',
                  textColor: 'text-violet-700'
                },
                body: { 
                  icon: '💪', 
                  label: 'Body', 
                  color: 'from-orange-500 to-red-600',
                  bgColor: 'bg-orange-100',
                  textColor: 'text-orange-700'
                },
                soul: { 
                  icon: '✨', 
                  label: 'Soul', 
                  color: 'from-emerald-500 to-teal-600',
                  bgColor: 'bg-emerald-100',
                  textColor: 'text-emerald-700'
                }
              };
              
              const categoryConfig = categoryConfigs[category as keyof typeof categoryConfigs] || {
                icon: '⚡',
                label: 'Other',
                color: 'from-gray-500 to-gray-600',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700'
              };
              
              return (
                <div key={category} className={`${categoryConfig.bgColor} rounded-2xl p-6 space-y-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${categoryConfig.color} flex items-center justify-center text-xl`}>
                      {categoryConfig.icon}
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${categoryConfig.textColor}`}>
                        {categoryConfig.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {categoryHabits.length} habits
                      </p>
                    </div>
                  </div>
                  
                  {/* Animated progress bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Avg Streak</span>
                        <span className="font-bold">{Math.round(avgStreak)} days</span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r ${categoryConfig.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${Math.min((avgStreak / 67) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Today Complete</span>
                        <span className="font-bold">{Math.round(completionRate)}%</span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r ${categoryConfig.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
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