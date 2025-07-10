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
  const avgConsistency = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.length * 100) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  // Generate individual habit data for multi-line graph
  const generateHabitData = (habit: Habit) => {
    return Array.from({ length: 30 }, (_, i) => {
      const baseConsistency = Math.min(habit.streak / 365, 1) * 100;
      const variance = Math.random() * 30 - 15; // ±15% variance
      return Math.max(0, Math.min(100, baseConsistency + variance));
    });
  };

  const habitColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ];

  return (
    <div className="space-y-6">
      {/* Live Multi-Habit Consistency Graph */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Foundation Consistency Tracking</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{avgConsistency}%</div>
                <div className="text-xs text-gray-500">Avg</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{longestStreak}</div>
                <div className="text-xs text-gray-500">Peak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{completedToday}</div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {habits.length > 0 ? (
            <>
              <div className="relative h-32">
                <svg className="w-full h-full" viewBox="0 0 400 128">
                  {/* Grid lines */}
                  {[0, 32, 64, 96, 128].map((y) => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1"/>
                  ))}
                  
                  {/* Individual habit lines */}
                  {habits.slice(0, 8).map((habit, habitIndex) => {
                    const habitData = generateHabitData(habit);
                    const color = habitColors[habitIndex % habitColors.length];
                    
                    return (
                      <g key={habit.id}>
                        {/* Habit line */}
                        <polyline
                          points={habitData.map((value, index) => 
                            `${(index * 400) / (habitData.length - 1)},${128 - (value * 128) / 100}`
                          ).join(' ')}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.8"
                        />
                        
                        {/* Data points */}
                        {habitData.map((value, index) => (
                          <circle
                            key={index}
                            cx={(index * 400) / (habitData.length - 1)}
                            cy={128 - (value * 128) / 100}
                            r="1.5"
                            fill={color}
                          />
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {habits.slice(0, 8).map((habit, index) => (
                  <div key={habit.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habitColors[index % habitColors.length] }}
                    />
                    <span className="text-xs text-gray-600 truncate max-w-24">{habit.title}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No foundation habits yet. Add habits to see consistency tracking.</p>
            </div>
          )}
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
                      <span className="text-xs text-blue-600 font-medium">
                        {habit.streak} day streak
                      </span>
                      <span className="text-xs text-gray-500">
                        {habit.streak}/{habit.streak + (habit.completedToday ? 0 : 1)} days
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
                      <span className="text-xs text-orange-600 font-medium">
                        {habit.streak} day streak
                      </span>
                      <span className="text-xs text-gray-500">
                        {habit.streak}/{habit.streak + (habit.completedToday ? 0 : 1)} days
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
                      <span className="text-xs text-emerald-600 font-medium">
                        {habit.streak} day streak
                      </span>
                      <span className="text-xs text-gray-500">
                        {habit.streak}/{habit.streak + (habit.completedToday ? 0 : 1)} days
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