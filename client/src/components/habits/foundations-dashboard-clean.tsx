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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const completedToday = habits.filter(h => h.completedToday).length;
  const avgConsistency = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + Math.min(h.streak / 365, 1), 0) / habits.length * 100) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  // Generate habit completion data for calendar
  const generateHabitCalendarData = (habit: Habit) => {
    // Generate last 30 days of data based on streak and current completion
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate completion based on streak (higher streak = higher completion rate)
      const completionRate = Math.min(habit.streak / 30, 0.85) + 0.1; // 10-95% based on streak
      const isCompleted = Math.random() < completionRate;
      
      days.push({
        date,
        completed: isCompleted,
        dayOfMonth: date.getDate()
      });
    }
    return days;
  };

  // Calendar navigation functions
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

  // Calculate completion percentage for category tiles
  const getCategoryCompletionColor = (categoryHabits: Habit[]) => {
    if (categoryHabits.length === 0) return 'bg-gray-100';
    
    const completedCount = categoryHabits.filter(h => h.completedToday).length;
    const completionPercentage = completedCount / categoryHabits.length;
    
    if (completionPercentage === 1) return 'bg-green-500'; // Deep green for 100%
    if (completionPercentage >= 0.75) return 'bg-green-400'; // Light green for 75%+
    if (completionPercentage >= 0.5) return 'bg-yellow-400'; // Yellow for 50%+
    if (completionPercentage >= 0.25) return 'bg-orange-400'; // Orange for 25%+
    return 'bg-red-400'; // Red for <25%
  };

  return (
    <div className="space-y-6">
      {/* Foundation Consistency Metrics */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Foundation Consistency</CardTitle>
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
      </Card>

      {/* Foundation Categories with Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mind Foundations */}
        <Card className={`border-0 shadow-lg relative transition-all duration-300 ${getCategoryCompletionColor(habits.filter(h => h.category === 'mind'))}`}>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpandedCategory(expandedCategory === 'mind' ? null : 'mind')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <CardTitle className="text-lg text-white">Mind Foundations</CardTitle>
              </div>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${expandedCategory === 'mind' ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-sm text-white/80">Mental discipline & cognitive growth</p>
          </CardHeader>
          
          {expandedCategory === 'mind' && (
            <CardContent className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between bg-white rounded-lg p-2">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-sm font-medium text-gray-700">{formatMonthYear(currentDate)}</h3>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid for each Mind habit */}
              {habits.filter(h => h.category === 'mind').map((habit) => {
                const calendarData = generateHabitCalendarData(habit);
                const completedDays = calendarData.filter(d => d.completed).length;
                
                return (
                  <div key={habit.id} className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-800">{habit.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>{habit.streak} day streak</span>
                        <span>•</span>
                        <span>{completedDays}/30 days</span>
                      </div>
                    </div>
                    
                    {/* 30-day calendar grid */}
                    <div className="grid grid-cols-10 gap-1">
                      {calendarData.map((day, index) => (
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
                );
              })}
              
              {habits.filter(h => h.category === 'mind').length === 0 && (
                <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                  <p className="text-sm">No mind habits yet.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Body Foundations */}
        <Card className={`border-0 shadow-lg relative transition-all duration-300 ${getCategoryCompletionColor(habits.filter(h => h.category === 'body'))}`}>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpandedCategory(expandedCategory === 'body' ? null : 'body')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <CardTitle className="text-lg text-white">Body Foundations</CardTitle>
              </div>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${expandedCategory === 'body' ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-sm text-white/80">Physical health & fitness consistency</p>
          </CardHeader>
          
          {expandedCategory === 'body' && (
            <CardContent className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between bg-white rounded-lg p-2">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-sm font-medium text-gray-700">{formatMonthYear(currentDate)}</h3>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid for each Body habit */}
              {habits.filter(h => h.category === 'body').map((habit) => {
                const calendarData = generateHabitCalendarData(habit);
                const completedDays = calendarData.filter(d => d.completed).length;
                
                return (
                  <div key={habit.id} className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-800">{habit.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>{habit.streak} day streak</span>
                        <span>•</span>
                        <span>{completedDays}/30 days</span>
                      </div>
                    </div>
                    
                    {/* 30-day calendar grid */}
                    <div className="grid grid-cols-10 gap-1">
                      {calendarData.map((day, index) => (
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
                );
              })}
              
              {habits.filter(h => h.category === 'body').length === 0 && (
                <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                  <p className="text-sm">No body habits yet.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Soul Foundations */}
        <Card className={`border-0 shadow-lg relative transition-all duration-300 ${getCategoryCompletionColor(habits.filter(h => h.category === 'soul'))}`}>
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpandedCategory(expandedCategory === 'soul' ? null : 'soul')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                <CardTitle className="text-lg text-white">Soul Foundations</CardTitle>
              </div>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${expandedCategory === 'soul' ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-sm text-white/80">Spiritual growth & purpose alignment</p>
          </CardHeader>
          
          {expandedCategory === 'soul' && (
            <CardContent className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between bg-white rounded-lg p-2">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-sm font-medium text-gray-700">{formatMonthYear(currentDate)}</h3>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid for each Soul habit */}
              {habits.filter(h => h.category === 'soul').map((habit) => {
                const calendarData = generateHabitCalendarData(habit);
                const completedDays = calendarData.filter(d => d.completed).length;
                
                return (
                  <div key={habit.id} className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-800">{habit.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>{habit.streak} day streak</span>
                        <span>•</span>
                        <span>{completedDays}/30 days</span>
                      </div>
                    </div>
                    
                    {/* 30-day calendar grid */}
                    <div className="grid grid-cols-10 gap-1">
                      {calendarData.map((day, index) => (
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
                );
              })}
              
              {habits.filter(h => h.category === 'soul').length === 0 && (
                <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                  <p className="text-sm">No soul habits yet.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}