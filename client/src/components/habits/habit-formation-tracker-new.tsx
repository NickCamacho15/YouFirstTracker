import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfDay, subDays, isSameDay } from "date-fns";
import { Trophy } from "lucide-react";

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
  // Filter habits that are in formation (streak < 67 days)
  const formationHabits = habits.filter(h => h.streak < 67);
  
  if (formationHabits.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No habits in formation. All your habits are fully formed!</p>
        </CardContent>
      </Card>
    );
  }
  
  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs"],
  });

  const getLast67Days = () => {
    const days = [];
    for (let i = 66; i >= 0; i--) {
      days.push(subDays(new Date(), i));
    }
    return days;
  };

  const days = getLast67Days();

  const isCompletedOnDay = (habitId: number, date: Date) => {
    return (habitLogs as HabitLog[]).some((log: HabitLog) => 
      log.habitId === habitId && 
      log.completed && 
      isSameDay(new Date(log.date), startOfDay(date))
    );
  };

  const getHabitColor = (habit: Habit) => {
    if (habit.category === 'mind') {
      return { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700', icon: '🧠' };
    } else if (habit.category === 'body') {
      return { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700', icon: '💪' };
    } else if (habit.category === 'soul') {
      return { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700', icon: '🙏' };
    }
    return { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700', icon: '⚡' };
  };

  const primaryHabit = formationHabits[0];

  return (
    <div className="space-y-6">
      {/* Small Habit Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {formationHabits.map((habit) => {
          const colors = getHabitColor(habit);
          const completionPercentage = Math.min((habit.streak / 67) * 100, 100);
          
          return (
            <Card key={habit.id} className="p-3 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">{colors.icon}</div>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{habit.title}</h4>
                
                {/* Mini Progress Ring */}
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                      className="text-gray-200" 
                    />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                      strokeLinecap="round"
                      className={colors.text}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{habit.streak}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {habit.streak}/67 days
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Formation Tracker */}
      {primaryHabit && (
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Formation Progress: {primaryHabit.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <DetailedTracker habit={primaryHabit} days={days} isCompletedOnDay={isCompletedOnDay} getHabitColor={getHabitColor} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailedTracker({ habit, days, isCompletedOnDay, getHabitColor }: {
  habit: Habit;
  days: Date[];
  isCompletedOnDay: (habitId: number, date: Date) => boolean;
  getHabitColor: (habit: Habit) => any;
}) {
  const colors = getHabitColor(habit);
  
  // Split into three stages based on habit formation science
  const stage1Days = days.slice(0, 18); // Days 1-18: Initial formation
  const stage2Days = days.slice(18, 45); // Days 19-45: Strengthening 
  const stage3Days = days.slice(45, 66); // Days 46-66: Automaticity
  const bonusDay = days.slice(66, 67); // Day 67: Bonus day

  const getStageCompletion = (stageDays: Date[]) => {
    const completed = stageDays.filter(day => isCompletedOnDay(habit.id, day)).length;
    return { completed, total: stageDays.length, percentage: Math.round((completed / stageDays.length) * 100) };
  };

  const stage1Stats = getStageCompletion(stage1Days);
  const stage2Stats = getStageCompletion(stage2Days);
  const stage3Stats = getStageCompletion(stage3Days);

  return (
    <div className="space-y-6">
      {/* Full 67-Day Grid */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">67-Day Formation Journey</h3>
        <div className="grid grid-cols-10 gap-1">
          {days.map((day, index) => {
            const isCompleted = isCompletedOnDay(habit.id, day);
            const isToday = isSameDay(day, new Date());
            
            let stageColor = 'bg-gray-200';
            if (index < 18) stageColor = 'bg-orange-200'; // Stage 1
            else if (index < 45) stageColor = 'bg-blue-200'; // Stage 2
            else if (index < 66) stageColor = 'bg-green-200'; // Stage 3
            else stageColor = 'bg-purple-200'; // Bonus day
            
            return (
              <div
                key={index}
                className={`w-6 h-6 rounded-md transition-all duration-200 ${
                  isCompleted 
                    ? colors.bg + ' text-white' 
                    : stageColor
                } ${isToday ? 'ring-2 ring-offset-1 ring-current' : ''} 
                flex items-center justify-center text-xs font-bold`}
                title={`Day ${index + 1}: ${format(day, 'MMM d')} - ${isCompleted ? 'Completed' : 'Not completed'}`}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Stage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
          <h4 className="font-semibold text-orange-800">Stage 1: Initial Formation</h4>
          <p className="text-sm text-orange-600 mb-2">Days 1-18 • Building awareness</p>
          <div className="text-2xl font-bold text-orange-800">
            {stage1Stats.completed}/{stage1Stats.total}
          </div>
          <div className="text-sm text-orange-600">{stage1Stats.percentage}% complete</div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h4 className="font-semibold text-blue-800">Stage 2: Strengthening</h4>
          <p className="text-sm text-blue-600 mb-2">Days 19-45 • Neural development</p>
          <div className="text-2xl font-bold text-blue-800">
            {stage2Stats.completed}/{stage2Stats.total}
          </div>
          <div className="text-sm text-blue-600">{stage2Stats.percentage}% complete</div>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <h4 className="font-semibold text-green-800">Stage 3: Automaticity</h4>
          <p className="text-sm text-green-600 mb-2">Days 46-67 • Becoming automatic</p>
          <div className="text-2xl font-bold text-green-800">
            {stage3Stats.completed}/{stage3Stats.total}
          </div>
          <div className="text-sm text-green-600">{stage3Stats.percentage}% complete</div>
        </div>
      </div>
    </div>
  );
}