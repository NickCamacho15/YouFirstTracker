import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp, X, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedHabit, setExpandedHabit] = useState<number | null>(null);
  
  const completedToday = habits.filter(h => h.completedToday).length;
  const avgConsistency = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.length * 100) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  // Generate habit completion data for calendar
  const generateHabitCalendarData = (habit: Habit) => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate completion based on streak (higher streak = higher completion rate)
      const completionRate = Math.min(habit.streak / 30, 0.85) + 0.1;
      const isCompleted = Math.random() < completionRate;
      
      days.push({
        date,
        completed: isCompleted,
        dayOfMonth: date.getDate()
      });
    }
    return days;
  };

  // Generate aggregated calendar data for all habits
  const generateAggregatedCalendarData = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Count how many habits were completed on this day (simulated)
      const completedHabitsCount = habits.reduce((count, habit) => {
        const completionRate = Math.min(habit.streak / 30, 0.85) + 0.1;
        return count + (Math.random() < completionRate ? 1 : 0);
      }, 0);
      
      const completionPercentage = habits.length > 0 ? completedHabitsCount / habits.length : 0;
      
      days.push({
        date,
        completedCount: completedHabitsCount,
        totalHabits: habits.length,
        completionPercentage,
        dayOfMonth: date.getDate()
      });
    }
    return days;
  };

  // Month navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get calendar color based on completion percentage
  const getCalendarDayColor = (completionPercentage: number) => {
    if (completionPercentage === 1) return 'bg-green-500';
    if (completionPercentage >= 0.75) return 'bg-green-400';
    if (completionPercentage >= 0.5) return 'bg-yellow-400';
    if (completionPercentage >= 0.25) return 'bg-orange-400';
    if (completionPercentage > 0) return 'bg-red-300';
    return 'bg-gray-200';
  };

  const aggregatedCalendarData = generateAggregatedCalendarData();

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Foundation Consistency</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Top-level Aggregated Calendar */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Habits Combined</CardTitle>
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
        <CardContent>
          {/* Aggregated 30-day calendar grid */}
          <div className="grid grid-cols-10 gap-2">
            {aggregatedCalendarData.map((day, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded text-xs flex items-center justify-center text-white font-medium ${
                  getCalendarDayColor(day.completionPercentage)
                }`}
                title={`${day.completedCount}/${day.totalHabits} habits completed`}
              >
                {day.dayOfMonth}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>50%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-300 rounded"></div>
              <span>&lt;50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>None</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Habit Tiles (List Format like Morning/Evening Routines) */}
      <div className="space-y-4">
        {/* Mind Foundations */}
        <Card className="border-0 shadow-lg">
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
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {habits.filter(h => h.category === 'mind').map((habit) => (
                <div key={habit.id}>
                  <div 
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
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedHabit === habit.id ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>

                  {/* Individual Habit Calendar (Expanded) */}
                  {expandedHabit === habit.id && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">{habit.title} - Last 30 Days</h4>
                      <div className="grid grid-cols-10 gap-1">
                        {generateHabitCalendarData(habit).map((day, index) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-medium ${
                              day.completed ? 'bg-green-500' : 'bg-red-400'
                            }`}
                          >
                            {day.dayOfMonth}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
        <Card className="border-0 shadow-lg">
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
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {habits.filter(h => h.category === 'body').map((habit) => (
                <div key={habit.id}>
                  <div 
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
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-orange-600"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedHabit === habit.id ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>

                  {/* Individual Habit Calendar (Expanded) */}
                  {expandedHabit === habit.id && (
                    <div className="mt-2 p-4 bg-orange-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">{habit.title} - Last 30 Days</h4>
                      <div className="grid grid-cols-10 gap-1">
                        {generateHabitCalendarData(habit).map((day, index) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-medium ${
                              day.completed ? 'bg-green-500' : 'bg-red-400'
                            }`}
                          >
                            {day.dayOfMonth}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {habits.filter(h => h.category === 'body').length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No body foundations yet. Add one to start building physical discipline!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Soul Foundations */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs">🙏</span>
                </div>
                <CardTitle className="text-base sm:text-lg">Soul Foundations</CardTitle>
              </div>
              <NewHabitModal 
                category="soul"
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                }
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Spiritual growth & purpose alignment
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {habits.filter(h => h.category === 'soul').map((habit) => (
                <div key={habit.id}>
                  <div 
                    className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                      habit.completedToday ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-indigo-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={habit.completedToday}
                      onChange={() => onToggleHabit(habit.id, !habit.completedToday)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm ${habit.completedToday ? 'text-indigo-800 font-medium' : 'text-gray-700'}`}>
                        {habit.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-indigo-600 font-medium">
                          {habit.streak} day streak
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedHabit === habit.id ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>

                  {/* Individual Habit Calendar (Expanded) */}
                  {expandedHabit === habit.id && (
                    <div className="mt-2 p-4 bg-indigo-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">{habit.title} - Last 30 Days</h4>
                      <div className="grid grid-cols-10 gap-1">
                        {generateHabitCalendarData(habit).map((day, index) => (
                          <div
                            key={index}
                            className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-medium ${
                              day.completed ? 'bg-green-500' : 'bg-red-400'
                            }`}
                          >
                            {day.dayOfMonth}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {habits.filter(h => h.category === 'soul').length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No soul foundations yet. Add one to start building spiritual discipline!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}