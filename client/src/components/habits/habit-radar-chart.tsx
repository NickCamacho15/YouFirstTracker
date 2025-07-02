import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HabitRadarChartProps {
  habits: Array<{
    id: number;
    title: string;
    streak: number;
    completedToday: boolean;
    category?: string;
  }>;
  rules: Array<{
    id: number;
    streak: number;
    completedToday: boolean;
    category: string;
  }>;
}

export function HabitRadarChart({ habits, rules }: HabitRadarChartProps) {
  // Calculate metrics for radar chart
  const calculateMetrics = () => {
    const totalHabits = habits.length;
    const totalRules = rules.length;
    
    // Consistency Score (0-100): Percentage of habits/rules completed today
    const completedHabits = habits.filter(h => h.completedToday).length;
    const completedRules = rules.filter(r => r.completedToday).length;
    const consistency = Math.round(((completedHabits + completedRules) / (totalHabits + totalRules)) * 100);
    
    // Momentum Score (0-100): Average streak length normalized
    const avgHabitStreak = habits.reduce((sum, h) => sum + h.streak, 0) / Math.max(totalHabits, 1);
    const avgRuleStreak = rules.reduce((sum, r) => sum + r.streak, 0) / Math.max(totalRules, 1);
    const momentum = Math.min(100, Math.round(((avgHabitStreak + avgRuleStreak) / 2) * 3)); // Scale to 100
    
    // Balance Score (0-100): How evenly distributed across categories
    const categories = ['Mind', 'Body', 'Soul', 'Digital Wellness', 'Nutrition', 'Sleep Hygiene', 'Mental Health', 'Fitness'];
    const categoryCount = categories.reduce((acc, cat) => {
      const count = [...habits, ...rules].filter(item => item.category === cat).length;
      acc[cat] = count;
      return acc;
    }, {} as Record<string, number>);
    
    const nonZeroCategories = Object.values(categoryCount).filter(count => count > 0).length;
    const balance = Math.round((nonZeroCategories / categories.length) * 100);
    
    // Engagement Score (0-100): Total active habits and rules
    const engagement = Math.min(100, Math.round(((totalHabits + totalRules) / 15) * 100)); // Scale based on having ~15 total items
    
    // Foundation Score (0-100): Strength of core habits (longer streaks weighted more)
    const longStreakHabits = habits.filter(h => h.streak >= 7).length;
    const longStreakRules = rules.filter(r => r.streak >= 7).length;
    const foundation = Math.round(((longStreakHabits + longStreakRules) / Math.max(totalHabits + totalRules, 1)) * 100);
    
    // Growth Score (0-100): Recent performance and improvement
    const todayScore = consistency;
    const growth = Math.max(0, Math.min(100, todayScore + (momentum * 0.3)));
    
    return [
      { metric: 'Consistency', score: consistency, fullMark: 100 },
      { metric: 'Momentum', score: momentum, fullMark: 100 },
      { metric: 'Balance', score: balance, fullMark: 100 },
      { metric: 'Engagement', score: engagement, fullMark: 100 },
      { metric: 'Foundation', score: foundation, fullMark: 100 },
      { metric: 'Growth', score: Math.round(growth), fullMark: 100 },
    ];
  };

  const data = calculateMetrics();
  const overallScore = Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    if (score >= 40) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <span>Habit Ecosystem</span>
          <div 
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ 
              backgroundColor: getScoreColor(overallScore),
              color: 'white'
            }}
          >
            {getScoreGrade(overallScore)}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Overall Performance: {overallScore}%
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                className="text-xs"
              />
              <Radar
                name="Performance"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">{item.metric}</span>
              <span 
                className="font-bold"
                style={{ color: getScoreColor(item.score) }}
              >
                {item.score}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}