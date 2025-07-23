import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Target, 
  BookOpen, 
  CheckSquare,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format, subDays } from "date-fns";

interface Habit {
  id: number;
  title: string;
  streak: number;
  category?: string;
  completedToday: boolean;
}

interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

interface CompactDashboardProps {
  habits: Habit[];
}

// Circular Progress Ring Component
function CircularProgress({ percentage, size = 80, strokeWidth = 8, color = "#3b82f6" }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Mini Line Chart Component
function MiniLineChart({ data, color = "#3b82f6", height = 60 }: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((max - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        {/* Dots for each point */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = ((max - value) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
    </div>
  );
}

export function CompactDashboard({ habits }: CompactDashboardProps) {
  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs"],
  });

  const { data: readingSessions = [] } = useQuery({
    queryKey: ["/api/reading-sessions"],
  });

  const metrics = useMemo(() => {
    if (habits.length === 0) {
      return {
        habitsCompletion: 0,
        foundationsStrength: 0,
        criticalTasks: 0,
        readingTime: 0,
        foundationsData: [],
        readingData: []
      };
    }

    // Calculate habits completion rate
    const completedToday = habits.filter(h => h.completedToday).length;
    const habitsCompletion = (completedToday / habits.length) * 100;

    // Calculate foundations strength (average streak progression)
    const avgStreak = habits.reduce((sum, h) => sum + h.streak, 0) / habits.length;
    const foundationsStrength = Math.min((avgStreak / 21) * 100, 100); // 21 days = 100%

    // Critical tasks completion (calculated from actual data)
    const criticalTasks = 0; // Will be populated from tasks API

    // Calculate reading time from actual sessions
    const totalReadingMinutes = readingSessions.reduce((total: number, session: any) => {
      return total + (session.durationMinutes || 0);
    }, 0);
    const readingTime = Math.min((totalReadingMinutes / 60) * 100, 100); // 60 minutes = 100%

    // Generate foundations trend data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const foundationsData = last7Days.map(day => {
      const dayCompletions = habits.reduce((count, habit) => {
        const hasLog = (habitLogs as HabitLog[]).some(log => 
          log.habitId === habit.id && 
          log.completed && 
          format(new Date(log.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        return count + (hasLog ? 1 : 0);
      }, 0);
      return habits.length > 0 ? (dayCompletions / habits.length) * 100 : 0;
    });

    // Generate reading time data from actual sessions (last 7 days)
    const readingData = last7Days.map(day => {
      const dayReadingMinutes = readingSessions.reduce((minutes: number, session: any) => {
        if (format(new Date(session.completedAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) {
          return minutes + (session.durationMinutes || 0);
        }
        return minutes;
      }, 0);
      return Math.min(dayReadingMinutes, 100); // Cap at 100 for chart display
    });

    return {
      habitsCompletion,
      foundationsStrength,
      criticalTasks,
      readingTime,
      foundationsData,
      readingData
    };
  }, [habits, habitLogs]);

  return (
    <div className="space-y-6">
      {/* Circular Progress Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Habits */}
        <div className="text-center">
          <CircularProgress 
            percentage={metrics.habitsCompletion} 
            color="#3b82f6"
          />
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              HABITS
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-blue-600">
              <Target className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Foundations */}
        <div className="text-center">
          <CircularProgress 
            percentage={metrics.foundationsStrength} 
            color="#f59e0b"
          />
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              FOUNDATIONS
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-amber-600">
              <Brain className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Critical Tasks */}
        <div className="text-center">
          <CircularProgress 
            percentage={metrics.criticalTasks} 
            color="#10b981"
          />
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              TASKS
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-emerald-600">
              <CheckSquare className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Reading Time */}
        <div className="text-center">
          <CircularProgress 
            percentage={metrics.readingTime} 
            color="#8b5cf6"
          />
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              READING
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-purple-600">
              <BookOpen className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Foundations Trend */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">FOUNDATIONS TREND</h3>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {Math.round(metrics.foundationsStrength)}%
              </Badge>
            </div>
            <div className="text-xs text-gray-400 mb-4">Last 7 days completion rate</div>
            <MiniLineChart 
              data={metrics.foundationsData} 
              color="#f59e0b"
              height={100}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>7d ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Reading Progress */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">READING PROGRESS</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {metrics.readingData[metrics.readingData.length - 1]}min
              </Badge>
            </div>
            <div className="text-xs text-gray-400 mb-4">Daily reading time (minutes)</div>
            <MiniLineChart 
              data={metrics.readingData} 
              color="#8b5cf6"
              height={100}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>7d ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-12 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
        >
          <Target className="w-4 h-4 mr-2" />
          View Habits
        </Button>
        <Button 
          variant="outline" 
          className="h-12 bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Start Reading
        </Button>
      </div>
    </div>
  );
}