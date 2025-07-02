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
      {/* Central Completion Graph - Transparent and Floating */}
      <div className="relative p-6 backdrop-blur-xl bg-white/15 border border-white/25 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-purple-50/10 to-emerald-50/10 rounded-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">FOUNDATION MONITOR</h2>
              <p className="text-gray-600 text-sm">Last updated {new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right">
              <div className="text-emerald-600 text-sm font-semibold">HIGH</div>
              <div className="text-gray-900 text-2xl font-bold">{completionRate}%</div>
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
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#94a3b8" strokeWidth="0.5" opacity="0.4"/>
              ))}
              
              {/* Mind line */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.mind * 120) / 100}`).join(' ')}
              />
              
              {/* Body line */}
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={last7Days.map((day, i) => `${(i * 400) / 6},${120 - (day.body * 120) / 100}`).join(' ')}
              />
              
              {/* Soul line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
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

      {/* Progress Circles for Each Habit */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {habits.map((habit) => {
          const colors = getCategoryGradient(habit.category);
          const progressPercentage = Math.min((habit.streak / 67) * 100, 100);
          const circumference = 2 * Math.PI * 45;
          const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
          
          return (
            <div key={habit.id} className="flex flex-col items-center space-y-3">
              {/* Progress Circle */}
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${colors.text} transition-all duration-500 ease-out`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-black text-gray-900">{habit.streak}</div>
                    <div className="text-xs text-gray-600">days</div>
                  </div>
                </div>
              </div>
              
              {/* Habit name and edit button */}
              <div className="text-center space-y-1">
                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{habit.title}</h4>
                <div className="text-xs text-gray-500">{habit.streak}/67 days</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditHabit(habit)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Daily Completion Tiles */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {habits.map((habit) => {
          const colors = getCategoryGradient(habit.category);
          
          return (
            <div 
              key={`tile-${habit.id}`}
              className={`relative rounded-xl p-4 aspect-square flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
                habit.completedToday 
                  ? `${colors.bg} shadow-lg` 
                  : 'bg-gray-100 hover:bg-gray-200 shadow-md'
              }`}
              onClick={() => onToggleHabit(habit.id, !habit.completedToday)}
            >
              {/* Icon */}
              <div className={`text-2xl mb-2 ${habit.completedToday ? 'text-white' : 'text-gray-600'}`}>
                {colors.icon}
              </div>
              
              {/* Completion indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                habit.completedToday 
                  ? 'bg-white border-white' 
                  : 'border-gray-400'
              }`}>
                {habit.completedToday && (
                  <CheckCircle2 className={`w-4 h-4 ${colors.text}`} />
                )}
              </div>
              
              {/* Title */}
              <div className={`text-xs font-semibold mt-2 text-center line-clamp-2 ${
                habit.completedToday ? 'text-white' : 'text-gray-700'
              }`}>
                {habit.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandala-Style Habit Radar Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Habit Formation Mandala
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