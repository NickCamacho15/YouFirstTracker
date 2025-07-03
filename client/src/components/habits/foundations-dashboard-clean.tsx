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
  const completedToday = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);
  
  // Calculate fitness-style metrics
  const totalHabits = habits.length;
  const avgStreak = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  return (
    <div className="space-y-8">
      {/* Foundation Monitor - Direct Page Integration */}
      <div className="relative">
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