import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap,
  Award,
  Sparkles
} from "lucide-react";
import { format, subDays } from "date-fns";

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
        grade: "Start",
        recommendations: ["Create your first habit to begin your journey!"]
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
    const momentum = Math.min((avgStreak / 21) * 100, 100);

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

    // Generate recommendations
    const recommendations = [];
    if (consistency < 70) recommendations.push("Set daily reminders");
    if (momentum < 50) recommendations.push("Focus on streak building");
    if (balance < 50) recommendations.push("Balance Mind, Body, Soul");
    if (engagement < 60) recommendations.push("Complete more habits today");
    if (habits.length < 3) recommendations.push("Add foundational habits");

    return {
      overallScore,
      consistency: Math.round(consistency),
      momentum: Math.round(momentum),
      balance: Math.round(balance),
      engagement: Math.round(engagement),
      grade,
      recommendations
    };
  }, [habits, habitLogs]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-400";
    if (score >= 60) return "from-yellow-500 to-amber-400";
    return "from-red-500 to-pink-400";
  };

  const getGradeGlow = (grade: string) => {
    if (grade.startsWith('A')) return "shadow-green-500/50";
    if (grade.startsWith('B')) return "shadow-blue-500/50";
    if (grade.startsWith('C')) return "shadow-yellow-500/50";
    return "shadow-red-500/50";
  };

  return (
    <div className="relative mb-8">
      {/* Glassmorphism container with gradient background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 border border-white/20 backdrop-blur-xl shadow-2xl">
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-4 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-400/25 to-rose-400/25 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Heart className="w-8 h-8 text-red-500 drop-shadow-lg" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Habit Health Score
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your wellness at a glance</p>
              </div>
            </div>
            
            {/* Score Display */}
            <div className="flex items-center gap-6">
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${getScoreColor(healthMetrics.overallScore)} shadow-xl ${getGradeGlow(healthMetrics.grade)}`}>
                <div className="text-center">
                  <div className="text-4xl font-black text-white drop-shadow-lg">
                    {healthMetrics.overallScore}
                  </div>
                  <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                    Health Score
                  </div>
                </div>
                
                {/* Floating grade badge */}
                <div className="absolute -top-3 -right-3 bg-white text-gray-900 text-xl font-black px-3 py-1 rounded-full shadow-lg border-2 border-gray-100">
                  {healthMetrics.grade}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Consistency */}
            <div className="group cursor-pointer">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Consistency</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{healthMetrics.consistency}%</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${healthMetrics.consistency}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">7-day rate</p>
                </div>
              </div>
            </div>

            {/* Momentum */}
            <div className="group cursor-pointer">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Momentum</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-600">{healthMetrics.momentum}%</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-400 h-2 rounded-full transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${healthMetrics.momentum}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Streak power</p>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="group cursor-pointer">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:border-purple-300/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-purple-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Balance</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">{healthMetrics.balance}%</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-2 rounded-full transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${healthMetrics.balance}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Mind•Body•Soul</p>
                </div>
              </div>
            </div>

            {/* Today's Energy */}
            <div className="group cursor-pointer">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:border-green-300/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-green-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Today</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">{healthMetrics.engagement}%</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-700 ease-out shadow-sm" 
                      style={{ width: `${healthMetrics.engagement}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {healthMetrics.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-amber-500" />
                <h4 className="font-bold text-amber-800 dark:text-amber-300">Quick Wins</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {healthMetrics.recommendations.map((rec, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300/50 px-3 py-1 text-sm font-medium hover:scale-105 transition-transform cursor-pointer"
                  >
                    {rec}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}