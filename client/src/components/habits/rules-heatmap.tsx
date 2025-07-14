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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Personal Rules Adherence</CardTitle>
            <p className="text-xs text-gray-500 mt-1">30-day discipline overview</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
            <p className="text-xs text-gray-500">today</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Minimal Stats Row */}
        <div className="flex justify-around py-3 border-b border-gray-100 mb-4">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{totalRules}</div>
            <p className="text-xs text-gray-500">Active Rules</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{completedToday}</div>
            <p className="text-xs text-gray-500">Kept Today</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{avgStreak}</div>
            <p className="text-xs text-gray-500">Avg Streak</p>
          </div>
        </div>

        {/* Larger Heat Map Calendar - No Padding */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">30-Day Consistency</h4>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">Less</span>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 bg-gray-200 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-red-400 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-orange-400 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
              </div>
              <span className="text-gray-500">More</span>
            </div>
          </div>
          
          <div className="grid grid-cols-10 gap-1">
            {Object.entries(monthData).map(([date, value]) => {
              const day = new Date(date).getDate();
              const isToday = new Date(date).toDateString() === new Date().toDateString();
              return (
                <div
                  key={date}
                  className={`aspect-square rounded ${getColorForValue(value)} relative group cursor-pointer ${
                    isToday ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                  }`}
                  title={`Day ${day}: ${Math.round(value * 100)}% completion`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </CardContent>
    </Card>
  );
}