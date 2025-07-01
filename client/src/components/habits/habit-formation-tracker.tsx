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
  habit: Habit;
}

export function HabitFormationTracker({ habit }: HabitFormationTrackerProps) {
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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            {habit.title} - Formation Journey
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Current Streak: {habit.streak} days
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Track your habit through the three scientifically-backed stages of formation
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stage 1: Initial Formation (Days 1-18) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <div>
                <h4 className="font-semibold text-sm">Stage 1: Initial Formation</h4>
                <p className="text-xs text-muted-foreground">Days 1-18</p>
              </div>
            </div>
            {renderStageProgress(stage1Days, 1, stage1Stats)}
            <p className="text-xs text-muted-foreground">
              Building awareness and initial momentum. Requires high motivation and conscious effort.
            </p>
          </div>

          {/* Stage 2: Strengthening (Days 19-45) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-semibold text-sm">Stage 2: Strengthening</h4>
                <p className="text-xs text-muted-foreground">Days 19-45</p>
              </div>
            </div>
            {renderStageProgress(stage2Days, 2, stage2Stats)}
            <p className="text-xs text-muted-foreground">
              Neural pathways strengthen. The habit becomes easier but still requires conscious choice.
            </p>
          </div>

          {/* Stage 3: Automaticity (Days 46-67) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="font-semibold text-sm">Stage 3: Automaticity + Bonus</h4>
                <p className="text-xs text-muted-foreground">Days 46-67</p>
              </div>
            </div>
            {renderStageProgress(stage3Days, 3, stage3Stats)}
            <p className="text-xs text-muted-foreground">
              Automaticity achieved + your special .uoY bonus day for extra mastery.
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="relative mt-8 p-6 bg-gradient-to-br from-violet-400/15 via-purple-300/10 to-fuchsia-400/15 rounded-2xl border border-violet-200 dark:border-violet-700/50 overflow-hidden">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 via-purple-300/15 to-fuchsia-400/20 opacity-60 blur-lg" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg">Overall Formation Progress</span>
              <span className="text-sm font-medium px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full">
                {stage1Stats.completed + stage2Stats.completed + stage3Stats.completed}/67 days
              </span>
            </div>
            
            <div className="w-full bg-white/60 dark:bg-gray-800/60 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
              <div
                className={`${colors.bg} h-4 rounded-full transition-all duration-1000 ease-out shadow-lg`}
                style={{
                  width: `${Math.round(((stage1Stats.completed + stage2Stats.completed + stage3Stats.completed) / 67) * 100)}%`
                }}
              />
            </div>
            
            <p className="text-sm text-center font-medium opacity-90">
              Foundational habit consistency tracking - maintain your lifestyle habit ✨
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}