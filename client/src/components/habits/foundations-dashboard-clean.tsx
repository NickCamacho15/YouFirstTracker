import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp, X, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewHabitModal } from "@/components/habits/new-habit-modal";

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
  const completionRate = Math.round((completedToday / Math.max(1, habits.length)) * 100);
  
  // Calculate long-term consistency metrics
  const totalHabits = habits.length;
  const avgConsistency = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.length * 100) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  // Generate mock 30-day consistency data for live graph
  const generateConsistencyData = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const baseConsistency = avgConsistency;
      const variance = Math.random() * 40 - 20; // ±20% variance
      return Math.max(0, Math.min(100, baseConsistency + variance));
    });
  };

  const consistencyData = generateConsistencyData();

  return (
    <div className="space-y-6">
      {/* Consistency Analytics - Compressed */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black mb-1">FOUNDATION CONSISTENCY</h1>
            <p className="text-gray-300 text-sm">Long-term commitment tracking</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 text-xs font-bold tracking-wide">ADHERENCE</div>
            <div className="text-3xl font-black text-white">{avgConsistency}%</div>
            <div className="text-green-400 text-xs">LIFETIME</div>
          </div>
        </div>
        
        {/* Compressed Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-yellow-400 text-xl font-black">{longestStreak}</div>
            <div className="text-gray-300 text-xs">PEAK STREAK</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-blue-400 text-xl font-black">{completedToday}</div>
            <div className="text-gray-300 text-xs">TODAY</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-purple-400 text-xl font-black">{habits.filter(h => h.streak >= 100).length}</div>
            <div className="text-gray-300 text-xs">100+ DAYS</div>
          </div>
        </div>
      </div>

      {/* Live Consistency Graph - Minimalist */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">30-Day Consistency</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">{consistencyData[consistencyData.length - 1].toFixed(0)}%</div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative h-24">
            <svg className="w-full h-full" viewBox="0 0 400 96">
              {/* Grid lines */}
              {[0, 24, 48, 72, 96].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1"/>
              ))}
              
              {/* Consistency line */}
              <polyline
                points={consistencyData.map((value, index) => 
                  `${(index * 400) / (consistencyData.length - 1)},${96 - (value * 96) / 100}`
                ).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {consistencyData.map((value, index) => (
                <circle
                  key={index}
                  cx={(index * 400) / (consistencyData.length - 1)}
                  cy={96 - (value * 96) / 100}
                  r="2"
                  fill="#3b82f6"
                />
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Foundation Categories - Same Tile Layout as New Habits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mind Foundations */}
        <Card className="border-0 shadow-lg relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-xs">🧠</span>
                </div>
                <CardTitle className="text-base sm:text-lg">Mind Foundations</CardTitle>
              </div>
              <NewHabitModal 
                category="mind"
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                }
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Mental discipline & cognitive growth
            </p>
            
            {/* Consistency Metrics */}
            <div className="bg-blue-50 rounded-lg p-3 mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-800">Long-term Adherence</span>
                <span className="text-xs font-bold text-blue-800">
                  {habits.filter(h => h.category === 'mind').length > 0 
                    ? Math.round(habits.filter(h => h.category === 'mind').reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.filter(h => h.category === 'mind').length * 100)
                    : 0}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {habits.filter(h => h.category === 'mind' && h.streak >= 100).length}
                  </div>
                  <div className="text-gray-600">100+ Days</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {habits.filter(h => h.category === 'mind').length > 0 
                      ? Math.round(habits.filter(h => h.category === 'mind').reduce((acc, h) => acc + h.streak, 0) / habits.filter(h => h.category === 'mind').length) 
                      : 0}
                  </div>
                  <div className="text-gray-600">Avg Streak</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {habits.filter(h => h.category === 'mind').map((habit) => (
                <div 
                  key={habit.id}
                  className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                    habit.completedToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-blue-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={habit.completedToday}
                    onChange={() => onToggleHabit(habit.id, !habit.completedToday)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                      {habit.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        habit.streak >= 365
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                          : habit.streak >= 100
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {Math.round((habit.streak / 365) * 100)}% year
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {habits.filter(h => h.category === 'mind').length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No mind foundations yet. Add one to start building mental discipline!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Body Foundations */}
        <Card className="border-0 shadow-lg relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-white text-xs">💪</span>
                </div>
                <CardTitle className="text-base sm:text-lg">Body Foundations</CardTitle>
              </div>
              <NewHabitModal 
                category="body"
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                }
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Physical health & fitness consistency
            </p>
            
            {/* Consistency Metrics */}
            <div className="bg-orange-50 rounded-lg p-3 mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-orange-800">Long-term Adherence</span>
                <span className="text-xs font-bold text-orange-800">
                  {habits.filter(h => h.category === 'body').length > 0 
                    ? Math.round(habits.filter(h => h.category === 'body').reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.filter(h => h.category === 'body').length * 100)
                    : 0}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-orange-600">
                    {habits.filter(h => h.category === 'body' && h.streak >= 100).length}
                  </div>
                  <div className="text-gray-600">100+ Days</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">
                    {habits.filter(h => h.category === 'body').length > 0 
                      ? Math.round(habits.filter(h => h.category === 'body').reduce((acc, h) => acc + h.streak, 0) / habits.filter(h => h.category === 'body').length) 
                      : 0}
                  </div>
                  <div className="text-gray-600">Avg Streak</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {habits.filter(h => h.category === 'body').map((habit) => (
                <div 
                  key={habit.id}
                  className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                    habit.completedToday ? 'bg-orange-50 border-orange-200' : 'border-gray-200 hover:bg-orange-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={habit.completedToday}
                    onChange={() => onToggleHabit(habit.id, !habit.completedToday)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-orange-800 font-medium' : 'text-gray-700'}`}>
                      {habit.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        habit.streak >= 365
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                          : habit.streak >= 100
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {Math.round((habit.streak / 365) * 100)}% year
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {habits.filter(h => h.category === 'body').length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No body foundations yet. Add one to start building physical strength!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Soul Foundations */}
        <Card className="border-0 shadow-lg relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white text-xs">✨</span>
                </div>
                <CardTitle className="text-base sm:text-lg">Soul Foundations</CardTitle>
              </div>
              <NewHabitModal 
                category="soul"
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                }
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Spiritual growth & purpose alignment
            </p>
            
            {/* Consistency Metrics */}
            <div className="bg-emerald-50 rounded-lg p-3 mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-emerald-800">Long-term Adherence</span>
                <span className="text-xs font-bold text-emerald-800">
                  {habits.filter(h => h.category === 'soul').length > 0 
                    ? Math.round(habits.filter(h => h.category === 'soul').reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.filter(h => h.category === 'soul').length * 100)
                    : 0}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-emerald-600">
                    {habits.filter(h => h.category === 'soul' && h.streak >= 100).length}
                  </div>
                  <div className="text-gray-600">100+ Days</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-emerald-600">
                    {habits.filter(h => h.category === 'soul').length > 0 
                      ? Math.round(habits.filter(h => h.category === 'soul').reduce((acc, h) => acc + h.streak, 0) / habits.filter(h => h.category === 'soul').length) 
                      : 0}
                  </div>
                  <div className="text-gray-600">Avg Streak</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {habits.filter(h => h.category === 'soul').map((habit) => (
                <div 
                  key={habit.id}
                  className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                    habit.completedToday ? 'bg-emerald-50 border-emerald-200' : 'border-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={habit.completedToday}
                    onChange={() => onToggleHabit(habit.id, !habit.completedToday)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-emerald-800 font-medium' : 'text-gray-700'}`}>
                      {habit.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        habit.streak >= 365
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                          : habit.streak >= 100
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {Math.round((habit.streak / 365) * 100)}% year
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {habits.filter(h => h.category === 'soul').length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No soul foundations yet. Add one to start nurturing your spiritual growth!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}