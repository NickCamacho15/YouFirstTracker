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

  const mindCompletion = Math.round(habits.filter(h => h.category === 'mind' && h.completedToday).length / Math.max(habits.filter(h => h.category === 'mind').length, 1) * 100);
  const bodyCompletion = Math.round(habits.filter(h => h.category === 'body' && h.completedToday).length / Math.max(habits.filter(h => h.category === 'body').length, 1) * 100);
  const soulCompletion = Math.round(habits.filter(h => h.category === 'soul' && h.completedToday).length / Math.max(habits.filter(h => h.category === 'soul').length, 1) * 100);

  // New vibrant color schemes for tiles
  const getNewTileColors = (category?: string, completed?: boolean) => {
    if (completed) {
      switch (category) {
        case 'mind':
          return {
            bg: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600',
            shadow: 'shadow-lg shadow-purple-500/30',
            glow: 'bg-purple-400/20',
            text: 'text-white',
            icon: '🧠'
          };
        case 'body':
          return {
            bg: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
            shadow: 'shadow-lg shadow-red-500/30',
            glow: 'bg-red-400/20',
            text: 'text-white',
            icon: '💪'
          };
        case 'soul':
          return {
            bg: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
            shadow: 'shadow-lg shadow-teal-500/30',
            glow: 'bg-teal-400/20',
            text: 'text-white',
            icon: '✨'
          };
        default:
          return {
            bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
            shadow: 'shadow-lg shadow-blue-500/30',
            glow: 'bg-blue-400/20',
            text: 'text-white',
            icon: '⭐'
          };
      }
    } else {
      // Muted but colorful uncompleted states
      switch (category) {
        case 'mind':
          return {
            bg: 'bg-gradient-to-br from-violet-100 to-purple-200',
            shadow: 'shadow-md',
            glow: 'bg-purple-50',
            text: 'text-purple-700',
            icon: '🧠'
          };
        case 'body':
          return {
            bg: 'bg-gradient-to-br from-orange-100 to-red-200',
            shadow: 'shadow-md',
            glow: 'bg-orange-50',
            text: 'text-red-700',
            icon: '💪'
          };
        case 'soul':
          return {
            bg: 'bg-gradient-to-br from-emerald-100 to-teal-200',
            shadow: 'shadow-md',
            glow: 'bg-emerald-50',
            text: 'text-teal-700',
            icon: '✨'
          };
        default:
          return {
            bg: 'bg-gradient-to-br from-gray-100 to-slate-200',
            shadow: 'shadow-md',
            glow: 'bg-gray-50',
            text: 'text-gray-700',
            icon: '⭐'
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

        {/* 7-Day Performance Chart */}
        <div className="relative h-32 mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-gray-100 border border-gray-200">
          <svg className="w-full h-full" viewBox="0 0 400 120">
            {/* Grid */}
            {[0, 30, 60, 90, 120].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#94a3b8" strokeWidth="0.5" opacity="0.4"/>
            ))}
            
            {/* Performance lines */}
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.mind * 120) / 100}`).join(' ')}
            />
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.body * 120) / 100}`).join(' ')}
            />
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.soul * 120) / 100}`).join(' ')}
            />
          </svg>
        </div>
      </div>

      {/* Vibrant Habit Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {habits.map((habit) => {
          const colors = getNewTileColors(habit.category, habit.completedToday);
          const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
          
          return (
            <div 
              key={`vibrant-${habit.id}`}
              className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer transform ${colors.bg} ${colors.shadow}`}
              onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 ${colors.glow} rounded-2xl blur-xl opacity-50 -z-10`}></div>
              
              {/* Icon */}
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">{colors.icon}</div>
                <div className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>
                  {habit.category || 'general'}
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-16 h-16 mx-auto mb-4">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-white/30"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                    className={`${colors.text} transition-all duration-700`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${colors.text}`}>{habit.streak}</span>
                </div>
              </div>
              
              {/* Title and Progress */}
              <div className="text-center">
                <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${colors.text}`}>{habit.title}</h4>
                <div className={`text-xs ${colors.text} opacity-90`}>{habit.streak}/67 days</div>
                
                {/* Completion Indicator */}
                <div className="mt-3 flex justify-center">
                  {habit.completedToday ? (
                    <CheckCircle2 className={`w-6 h-6 ${colors.text}`} />
                  ) : (
                    <Circle className={`w-6 h-6 ${colors.text} opacity-60`} />
                  )}
                </div>
              </div>
              
              {/* Edit Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditHabit(habit);
                }}
                className={`absolute top-2 right-2 h-8 w-8 p-0 ${colors.text} hover:bg-white/20`}
              >
                <Settings className="w-4 h-4" />
              </Button>
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
                const colors = getNewTileColors(habit.category, habit.completedToday);
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