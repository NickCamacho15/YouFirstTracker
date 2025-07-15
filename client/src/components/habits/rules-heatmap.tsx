import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

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
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base font-semibold text-gray-900">Rules Adherence</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{completionRate}%</div>
              <p className="text-[10px] text-gray-500 uppercase">Today</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{avgStreak}</div>
              <p className="text-[10px] text-gray-500 uppercase">Avg Streak</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {/* Compressed Heat Map Calendar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-medium text-gray-600 uppercase">Last 30 Days</h4>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-gray-400">0%</span>
              <div className="flex gap-0.5">
                <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
                <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
              </div>
              <span className="text-gray-400">100%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-15 gap-0.5">
            {Object.entries(monthData).map(([date, value]) => {
              const day = new Date(date).getDate();
              const isToday = new Date(date).toDateString() === new Date().toDateString();
              return (
                <div
                  key={date}
                  className={`aspect-square rounded-sm ${getColorForValue(value)} relative group cursor-pointer ${
                    isToday ? 'ring-1 ring-blue-600 ring-offset-1' : ''
                  }`}
                  title={`Day ${day}: ${Math.round(value * 100)}% completion`}
                >
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}