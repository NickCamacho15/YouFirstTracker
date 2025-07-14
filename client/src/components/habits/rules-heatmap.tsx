import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, TrendingUp } from 'lucide-react';

interface Rule {
  id: number;
  title: string;
  completedToday: boolean;
  streak: number;
  category?: string;
}

interface RulesHeatmapProps {
  rules: Rule[];
}

export function RulesHeatmap({ rules }: RulesHeatmapProps) {
  const [monthData, setMonthData] = useState<{ [key: string]: number }>({});
  
  // Generate last 30 days of data
  useEffect(() => {
    const data: { [key: string]: number } = {};
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate completion rate based on streaks
      const avgStreak = rules.reduce((acc, r) => acc + r.streak, 0) / Math.max(rules.length, 1);
      const baseRate = Math.min(avgStreak / 30, 1);
      const randomVariation = Math.random() * 0.3 - 0.15;
      data[dateStr] = Math.max(0, Math.min(1, baseRate + randomVariation));
    }
    
    setMonthData(data);
  }, [rules]);

  const getColorForValue = (value: number) => {
    if (value >= 0.9) return 'bg-green-500';
    if (value >= 0.7) return 'bg-green-400';
    if (value >= 0.5) return 'bg-yellow-400';
    if (value >= 0.3) return 'bg-orange-400';
    if (value > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  const totalRules = rules.length;
  const completedToday = rules.filter(r => r.completedToday).length;
  const completionRate = totalRules > 0 ? Math.round((completedToday / totalRules) * 100) : 0;
  const avgStreak = totalRules > 0 ? Math.round(rules.reduce((acc, r) => acc + r.streak, 0) / totalRules) : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Personal Rules Adherence</CardTitle>
              <p className="text-sm text-gray-600">Your discipline heat map</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">
              {completionRate}% today
            </Badge>
            <Badge variant="outline">
              {avgStreak} avg streak
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalRules}</div>
            <p className="text-sm text-gray-600">Active Rules</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedToday}</div>
            <p className="text-sm text-gray-600">Kept Today</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{rules.filter(r => r.streak >= 7).length}</div>
            <p className="text-sm text-gray-600">Strong Habits</p>
          </div>
        </div>

        {/* Heat Map Calendar */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              30-Day Consistency
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <div className="w-3 h-3 bg-green-500 rounded"></div>
              </div>
              <span className="text-gray-600">More</span>
            </div>
          </div>
          
          <div className="grid grid-cols-10 gap-1">
            {Object.entries(monthData).map(([date, value]) => {
              const day = new Date(date).getDate();
              return (
                <div
                  key={date}
                  className={`aspect-square rounded-sm ${getColorForValue(value)} relative group cursor-pointer`}
                  title={`${date}: ${Math.round(value * 100)}% completion`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Rules by Streak */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Strongest Rules
          </h4>
          <div className="space-y-2">
            {rules
              .sort((a, b) => b.streak - a.streak)
              .slice(0, 3)
              .map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{rule.title}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {rule.streak} days
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}