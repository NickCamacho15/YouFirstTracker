import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Target, 
  Flame, 
  Brain, 
  Activity,
  Zap,
  Award,
  BarChart3
} from "lucide-react";
import { format, subDays, isAfter, startOfDay } from "date-fns";

interface Habit {
  id: number;
  title: string;
  streak: number;
  category?: string;
  completedToday: boolean;
  createdAt?: string;
}

interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

interface HabitHealthScoreProps {
  habits: Habit[];
}

interface HealthMetrics {
  overallScore: number;
  consistency: number;
  momentum: number;
  balance: number;
  engagement: number;
  grade: string;
  insights: string[];
  recommendations: string[];
}

export function HabitHealthScore({ habits }: HabitHealthScoreProps) {
  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs"],
  });

  const healthMetrics: HealthMetrics = useMemo(() => {
    if (habits.length === 0) {
      return {
        overallScore: 0,
        consistency: 0,
        momentum: 0,
        balance: 0,
        engagement: 0,
        grade: "F",
        insights: ["No habits tracked yet"],
        recommendations: ["Create your first habit to get started!"]
      };
    }

    // Calculate consistency (last 7 days completion rate)
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));
    const totalPossibleCompletions = habits.length * 7;
    const actualCompletions = last7Days.reduce((count, day) => {
      return count + habits.reduce((dayCount, habit) => {
        const hasLog = (habitLogs as HabitLog[]).some(log => 
          log.habitId === habit.id && 
          log.completed && 
          format(new Date(log.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        return dayCount + (hasLog ? 1 : 0);
      }, 0);
    }, 0);
    const consistency = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0;

    // Calculate momentum (average streak across all habits)
    const avgStreak = habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length;
    const momentum = Math.min((avgStreak / 21) * 100, 100); // 21 days = 100% momentum

    // Calculate balance (diversity across Mind, Body, Soul categories)
    const categoryCount = {
      mind: habits.filter(h => h.category === 'mind').length,
      body: habits.filter(h => h.category === 'body').length,
      soul: habits.filter(h => h.category === 'soul').length
    };
    const totalCategories = Object.values(categoryCount).filter(count => count > 0).length;
    const balance = (totalCategories / 3) * 100;

    // Calculate engagement (habits completed today)
    const todayCompletions = habits.filter(h => h.completedToday).length;
    const engagement = habits.length > 0 ? (todayCompletions / habits.length) * 100 : 0;

    // Overall score (weighted average)
    const overallScore = Math.round(
      (consistency * 0.35) + 
      (momentum * 0.25) + 
      (balance * 0.20) + 
      (engagement * 0.20)
    );

    // Determine grade
    let grade = "F";
    if (overallScore >= 90) grade = "A+";
    else if (overallScore >= 85) grade = "A";
    else if (overallScore >= 80) grade = "A-";
    else if (overallScore >= 75) grade = "B+";
    else if (overallScore >= 70) grade = "B";
    else if (overallScore >= 65) grade = "B-";
    else if (overallScore >= 60) grade = "C+";
    else if (overallScore >= 55) grade = "C";
    else if (overallScore >= 50) grade = "C-";
    else if (overallScore >= 40) grade = "D";

    // Generate insights
    const insights = [];
    if (consistency >= 80) insights.push("Excellent consistency this week!");
    else if (consistency >= 60) insights.push("Good consistency, with room for improvement");
    else if (consistency < 40) insights.push("Consistency needs attention");

    if (momentum >= 70) insights.push("Strong habit momentum building");
    else if (momentum < 30) insights.push("Focus on building longer streaks");

    if (balance >= 67) insights.push("Well-balanced habit categories");
    else insights.push("Consider diversifying across Mind, Body, and Soul");

    if (engagement >= 80) insights.push("Great daily engagement today!");
    else if (engagement < 50) insights.push("Complete more habits today");

    // Generate recommendations
    const recommendations = [];
    if (consistency < 70) recommendations.push("Set daily reminders for habit completion");
    if (momentum < 50) recommendations.push("Focus on completing one habit consistently for 21 days");
    if (balance < 50) recommendations.push("Add habits in underrepresented categories");
    if (engagement < 60) recommendations.push("Start with your highest-priority habit today");
    if (habits.length < 3) recommendations.push("Consider adding 1-2 more foundational habits");

    return {
      overallScore,
      consistency: Math.round(consistency),
      momentum: Math.round(momentum),
      balance: Math.round(balance),
      engagement: Math.round(engagement),
      grade,
      insights,
      recommendations
    };
  }, [habits, habitLogs]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (grade.startsWith('B')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (grade.startsWith('C')) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Habit Health Score
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className={`text-lg font-bold px-4 py-2 ${getGradeColor(healthMetrics.grade)}`}
            >
              {healthMetrics.grade}
            </Badge>
            <div className={`text-3xl font-bold ${getScoreColor(healthMetrics.overallScore)}`}>
              {healthMetrics.overallScore}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your comprehensive habit wellness assessment
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Metric Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Consistency */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Consistency</span>
              <span className={`text-sm font-bold ${getScoreColor(healthMetrics.consistency)}`}>
                {healthMetrics.consistency}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${healthMetrics.consistency}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days completion rate</p>
          </div>

          {/* Momentum */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Momentum</span>
              <span className={`text-sm font-bold ${getScoreColor(healthMetrics.momentum)}`}>
                {healthMetrics.momentum}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${healthMetrics.momentum}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Average streak strength</p>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Balance</span>
              <span className={`text-sm font-bold ${getScoreColor(healthMetrics.balance)}`}>
                {healthMetrics.balance}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${healthMetrics.balance}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Mind, Body, Soul diversity</p>
          </div>

          {/* Today's Engagement */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Today</span>
              <span className={`text-sm font-bold ${getScoreColor(healthMetrics.engagement)}`}>
                {healthMetrics.engagement}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${healthMetrics.engagement}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Habits completed today</p>
          </div>
        </div>

        {/* Insights Section */}
        {healthMetrics.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500" />
              Key Insights
            </h4>
            <div className="grid gap-2">
              {healthMetrics.insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {healthMetrics.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Recommendations
            </h4>
            <div className="grid gap-2">
              {healthMetrics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              // This could trigger a detailed breakdown or sync action
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Heart className="w-5 h-5 mr-2" />
            View Detailed Breakdown
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}