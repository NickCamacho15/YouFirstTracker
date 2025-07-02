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

      {/* Large Interactive Habit Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {habits.map((habit) => {
          const colors = getLargeTileColors(habit.category, habit.completedToday);
          const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
          
          return (
            <div 
              key={`large-${habit.id}`}
              className={`relative rounded-3xl p-8 transition-all duration-700 hover:scale-105 transform ${colors.bg} ${colors.shadow} border-0 min-h-[300px] ${
                habit.completedToday ? 'animate-pulse' : ''
              }`}
            >
              {/* Enhanced glow effect */}
              <div className={`absolute inset-0 ${colors.glow} rounded-3xl blur-xl ${
                habit.completedToday ? 'opacity-80 animate-pulse' : 'opacity-40'
              } -z-10`}></div>
              
              {/* Celebration sparkles when completed */}
              {habit.completedToday && (
                <>
                  <div className="absolute top-4 right-4 text-2xl animate-bounce">✨</div>
                  <div className="absolute top-6 left-4 text-xl animate-bounce delay-200">⭐</div>
                  <div className="absolute bottom-4 right-6 text-lg animate-bounce delay-500">🎉</div>
                </>
              )}
              
              {/* Content */}
              <div className="relative text-center h-full flex flex-col">
                {/* Category Icon */}
                <div className="text-5xl mb-4">{colors.icon}</div>
                
                {/* Large Clickable Progress Ring */}
                <div 
                  className="relative w-32 h-32 mx-auto mb-6 cursor-pointer group" 
                  onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
                >
                  <svg className="w-32 h-32 transform -rotate-90 group-hover:scale-110 transition-transform duration-300">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      className="text-white/30"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={colors.ring}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700 drop-shadow-lg"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${colors.text} mb-1`}>{habit.streak}</span>
                    <span className={`text-sm font-bold ${colors.text} opacity-80`}>days</span>
                  </div>
                  
                  {/* Completion overlay - enhanced visual feedback */}
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    habit.completedToday 
                      ? 'bg-white/30 scale-105 shadow-2xl' 
                      : 'bg-white/10 scale-95 group-hover:scale-100 group-hover:bg-white/15'
                  }`}></div>
                  
                  {/* Multiple pulse effects when completed */}
                  {habit.completedToday && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-white/40 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-pulse"></div>
                    </>
                  )}
                </div>
                
                {/* Title and Progress */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className={`font-bold text-lg mb-2 line-clamp-2 ${colors.text}`}>{habit.title}</h4>
                    <div className={`text-sm mb-4 ${colors.text} opacity-90 font-semibold`}>{habit.streak}/67 days formation</div>
                    
                    {/* Category Badge */}
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${colors.text} bg-white/25 backdrop-blur-sm mb-6`}>
                      {habit.category?.toUpperCase() || 'GENERAL'}
                    </div>
                  </div>
                  
                  {/* Large Completion Indicator with enhanced styling */}
                  <div className="flex justify-center mb-6">
                    {habit.completedToday ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className={`w-12 h-12 ${colors.text} mb-2 animate-bounce`} />
                        <span className={`text-sm font-bold ${colors.text} bg-white/20 px-3 py-1 rounded-full`}>✅ COMPLETED</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Circle className={`w-12 h-12 ${colors.text} opacity-60 mb-2 group-hover:opacity-80 transition-opacity`} />
                        <span className={`text-sm font-bold ${colors.text} opacity-60 group-hover:opacity-80`}>TAP TO COMPLETE</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditHabit(habit);
                    }}
                    className={`w-full ${colors.text} hover:bg-white/20 border-2 border-white/30 rounded-xl py-3`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    EDIT HABIT
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Habit Formation Mandala - Enhanced */}
      <div className="relative">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Habit Formation Mandala
        </h3>
        
        <div className="flex flex-col items-center">
          {/* Radar Chart - Even Larger */}
          <div className="relative w-96 h-96 md:w-[500px] md:h-[500px] mb-8">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Background circles */}
              {[20, 40, 60, 80, 100].map((level) => (
                <circle
                  key={level}
                  cx="200"
                  cy="200"
                  r={level * 1.8}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity={0.3}
                />
              ))}
              
              {/* Grid lines */}
              {habits.map((_, index) => {
                const angle = (index * 360) / habits.length;
                const x2 = 200 + 180 * Math.cos((angle - 90) * Math.PI / 180);
                const y2 = 200 + 180 * Math.sin((angle - 90) * Math.PI / 180);
                
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
              
              {/* Habit progress points */}
              {habits.map((habit, index) => {
                const progressValue = Math.min((habit.streak / 67) * 180, 180);
                const angle = (index * 360) / habits.length;
                const x = 200 + progressValue * Math.cos((angle - 90) * Math.PI / 180);
                const y = 200 + progressValue * Math.sin((angle - 90) * Math.PI / 180);
                
                return (
                  <g key={`habit-${habit.id}`}>
                    {/* Habit progress point */}
                    <circle
                      cx={x}
                      cy={y}
                      r="15"
                      fill={habit.completedToday ? '#8b5cf6' : '#94a3b8'}
                      stroke="white"
                      strokeWidth="4"
                      className="drop-shadow-lg animate-pulse"
                    />
                    
                    {/* Inner glow effect */}
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill={habit.completedToday ? '#ffffff' : '#94a3b8'}
                      opacity="0.8"
                    />
                    
                    {/* Habit label */}
                    <text
                      x={200 + (progressValue + 25) * Math.cos((angle - 90) * Math.PI / 180)}
                      y={200 + (progressValue + 25) * Math.sin((angle - 90) * Math.PI / 180)}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#374151"
                      className="font-semibold"
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
              
              {/* Center text */}
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
        </div>
      </div>
    </div>
  );
}