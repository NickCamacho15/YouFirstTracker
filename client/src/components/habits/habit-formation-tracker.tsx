import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfDay, subDays, isSameDay } from "date-fns";
import { CheckCircle2, Circle, Brain, Zap, Trophy } from "lucide-react";

interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

interface Habit {
  id: number;
  title: string;
  streak: number;
  category?: string;
}

interface HabitFormationTrackerProps {
  habits: Habit[];
}

export function HabitFormationTracker({ habits }: HabitFormationTrackerProps) {
  // Use the first habit as the primary focus, or show overall stats
  const primaryHabit = habits[0];
  
  if (!primaryHabit) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No habits yet. Create your first habit to see formation tracking!</p>
        </CardContent>
      </Card>
    );
  }
  
  const habit = primaryHabit;
  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs"],
  });

  // Generate last 67 days (based on habit formation science + bonus day for .uoY)
  const getLast67Days = () => {
    const days = [];
    for (let i = 66; i >= 0; i--) {
      days.push(subDays(new Date(), i));
    }
    return days;
  };

  const days = getLast67Days();

  const isCompletedOnDay = (date: Date) => {
    return (habitLogs as HabitLog[]).some((log: HabitLog) => 
      log.habitId === habit.id && 
      log.completed && 
      isSameDay(new Date(log.date), startOfDay(date))
    );
  };

  const getHabitColor = (habit: Habit) => {
    if (habit.category === 'mind') {
      return { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' };
    } else if (habit.category === 'body') {
      return { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' };
    } else if (habit.category === 'soul') {
      return { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700' };
    }
    return { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' };
  };

  const colors = getHabitColor(habit);

  // Split into three stages based on habit formation science (plus bonus day)
  const stage1Days = days.slice(0, 18); // Days 1-18: Initial formation
  const stage2Days = days.slice(18, 45); // Days 19-45: Strengthening 
  const stage3Days = days.slice(45, 66); // Days 46-66: Automaticity
  const bonusDay = days.slice(66, 67); // Day 67: Bonus day for .uoY

  const getStageCompletion = (stageDays: Date[]) => {
    const completed = stageDays.filter(day => isCompletedOnDay(day)).length;
    return { completed, total: stageDays.length, percentage: Math.round((completed / stageDays.length) * 100) };
  };

  const stage1Stats = getStageCompletion(stage1Days);
  const stage2Stats = getStageCompletion(stage2Days);
  const stage3Stats = getStageCompletion(stage3Days);

  const renderStageProgress = (days: Date[], stageNumber: number, stageStats: any) => {
    const completedDays = days.filter(day => isCompletedOnDay(day)).length;
    const progressPercent = (completedDays / days.length) * 100;
    
    // Get gradient colors based on stage
    const getStageGradient = (stage: number) => {
      switch (stage) {
        case 1: return 'from-orange-400/20 via-red-300/15 to-pink-400/20';
        case 2: return 'from-blue-400/20 via-cyan-300/15 to-indigo-400/20';
        case 3: return 'from-green-400/20 via-emerald-300/15 to-teal-400/20';
        default: return 'from-gray-400/20 via-gray-300/15 to-gray-400/20';
      }
    };

    // Render all progress bubbles for this stage
    
    return (
      <div className={`relative p-5 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
        progressPercent === 100 
          ? `${colors.bg} ${colors.text} border-current shadow-xl shadow-current/25` 
          : `bg-gradient-to-br ${getStageGradient(stageNumber)} border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 backdrop-blur-sm`
      }`}>
        {/* Glowing background effect */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${getStageGradient(stageNumber)} opacity-50 blur-sm`} />
        
        <div className="relative z-10">
          {/* Stage progress bubbles */}
          <div className="grid grid-cols-9 gap-1 mb-4 justify-items-center">
            {days.map((day, index) => {
              const isCompleted = isCompletedOnDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    isCompleted 
                      ? `${colors.bg} shadow-sm` 
                      : `bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500`
                  } ${isToday ? 'ring-2 ring-white ring-offset-1' : ''}`}
                  title={`Day ${index + 1 + (stageNumber - 1) * (stageNumber === 3 ? 27 : 18)}: ${format(day, 'MMM d')} - ${isCompleted ? 'Completed' : 'Not completed'}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold">
              {completedDays}/{days.length}
            </div>
            <div className="text-sm opacity-75 font-medium">
              {Math.round(progressPercent)}%
            </div>
          </div>
          
          <div className="w-full bg-white/50 dark:bg-gray-800/50 rounded-full h-3 mb-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ease-out ${
                progressPercent > 0 ? colors.bg : 'bg-gray-300 dark:bg-gray-600'
              } shadow-sm`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          <div className="text-xs opacity-75 font-medium text-center">
            {progressPercent === 100 ? '🎉 Stage Complete!' : `${days.length - completedDays} days remaining`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-bold">{habit.title} - Formation Journey</h3>
              <p className="text-sm text-muted-foreground">67-day scientifically-backed formation</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Streak: {habit.streak} days
          </Badge>
        </div>

        {/* Compact Horizontal Stage Layout */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Stage 1 */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold">Stage 1</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Days 1-18</div>
            <div className="text-2xl font-bold text-orange-600">{stage1Stats.completed}/18</div>
            <div className="w-full bg-orange-100 dark:bg-orange-900/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stage1Stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Stage 2 */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold">Stage 2</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Days 19-45</div>
            <div className="text-2xl font-bold text-blue-600">{stage2Stats.completed}/27</div>
            <div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stage2Stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Stage 3 */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold">Stage 3</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Days 46-67</div>
            <div className="text-2xl font-bold text-green-600">{stage3Stats.completed}/22</div>
            <div className="w-full bg-green-100 dark:bg-green-900/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stage3Stats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Large Overall Progress Bar */}
        <div className="relative p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 rounded-2xl border border-violet-200 dark:border-violet-700/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Overall Formation Progress</span>
            <span className="text-lg font-bold text-purple-600">
              {stage1Stats.completed + stage2Stats.completed + stage3Stats.completed}/67 days
            </span>
          </div>
          
          {/* Large Visual Progress Bar */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-3 overflow-hidden shadow-inner">
            <div
              className={`${colors.bg} h-6 rounded-full transition-all duration-1000 ease-out shadow-lg relative`}
              style={{
                width: `${Math.round(((stage1Stats.completed + stage2Stats.completed + stage3Stats.completed) / 67) * 100)}%`
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {habit.streak < 67 ? `${67 - habit.streak} days until habit mastery` : "🎉 Habit mastered - Bonus day for .uoY!"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}