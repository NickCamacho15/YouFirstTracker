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

  const renderDaysGrid = (days: Date[], stageNumber: number) => (
    <div className="grid grid-cols-9 gap-1">
      {days.map((day, index) => {
        const isCompleted = isCompletedOnDay(day);
        const isToday = isSameDay(day, new Date());
        
        return (
          <div
            key={index}
            className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium transition-all duration-200 ${
              isCompleted 
                ? `${colors.bg} text-white shadow-sm` 
                : `${colors.light} ${colors.text} border border-gray-200 dark:border-gray-700`
            } ${isToday ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
            title={`${format(day, 'MMM d')}: ${isCompleted ? 'Completed' : 'Not completed'}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Circle className="w-3 h-3 opacity-50" />
            )}
          </div>
        );
      })}
    </div>
  );

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
      <CardContent className="space-y-6">
        {/* Stage 1: Initial Formation (Days 1-18) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-sm">Stage 1: Initial Formation</h4>
              <Badge variant="outline" className="text-xs">
                Days 1-18
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {stage1Stats.completed}/{stage1Stats.total} days ({stage1Stats.percentage}%)
            </div>
          </div>
          {renderDaysGrid(stage1Days, 1)}
          <p className="text-xs text-muted-foreground">
            Building awareness and initial momentum. Requires high motivation and conscious effort.
          </p>
        </div>

        {/* Stage 2: Strengthening (Days 19-45) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-sm">Stage 2: Strengthening</h4>
              <Badge variant="outline" className="text-xs">
                Days 19-45
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {stage2Stats.completed}/{stage2Stats.total} days ({stage2Stats.percentage}%)
            </div>
          </div>
          {renderDaysGrid(stage2Days, 2)}
          <p className="text-xs text-muted-foreground">
            Neural pathways strengthen. The habit becomes easier but still requires conscious choice.
          </p>
        </div>

        {/* Stage 3: Automaticity (Days 46-66) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-sm">Stage 3: Automaticity</h4>
              <Badge variant="outline" className="text-xs">
                Days 46-66
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {stage3Stats.completed}/{stage3Stats.total} days ({stage3Stats.percentage}%)
            </div>
          </div>
          {renderDaysGrid(stage3Days, 3)}
          <p className="text-xs text-muted-foreground">
            The habit becomes automatic. Neural pathways are well-established and require minimal effort.
          </p>
        </div>

        {/* Overall Progress */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Overall Formation Progress</span>
            <span className="text-sm text-muted-foreground">
              {stage1Stats.completed + stage2Stats.completed + stage3Stats.completed}/66 days
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
              style={{
                width: `${Math.round(((stage1Stats.completed + stage2Stats.completed + stage3Stats.completed) / 66) * 100)}%`
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Research shows it takes an average of 66 days to form a new habit automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}