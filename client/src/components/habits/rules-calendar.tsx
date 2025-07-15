import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const totalRules = rules.length;
  const completedToday = rules.filter(r => r.completedToday).length;
  const completionRate = totalRules > 0 ? Math.round((completedToday / totalRules) * 100) : 0;
  const avgStreak = totalRules > 0 ? Math.round(rules.reduce((acc, r) => acc + r.streak, 0) / totalRules) : 0;

  // Generate days for the calendar
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    
    // Generate 30 days
    for (let i = 0; i < 30; i++) {
      const dayNum = 30 - i;
      const isToday = i === 29;
      
      // Calculate color based on position (mock data)
      let colorClass = 'bg-gray-100';
      if (rules.length > 0) {
        const randomValue = Math.random();
        if (isToday) {
          colorClass = completionRate >= 80 ? 'bg-green-500' : 
                      completionRate >= 50 ? 'bg-yellow-400' : 
                      completionRate > 0 ? 'bg-orange-400' : 'bg-gray-100';
        } else {
          // Historical data based on average streak
          const baseRate = avgStreak / 30;
          const value = baseRate + (randomValue - 0.5) * 0.3;
          
          if (value >= 0.8) colorClass = 'bg-green-500';
          else if (value >= 0.6) colorClass = 'bg-green-400';
          else if (value >= 0.4) colorClass = 'bg-yellow-400';
          else if (value >= 0.2) colorClass = 'bg-orange-400';
          else if (value > 0) colorClass = 'bg-red-400';
        }
      }
      
      days.push({
        day: dayNum,
        colorClass,
        isToday
      });
    }
    
    return days.reverse();
  };

  const days = getDaysArray();

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
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-600 uppercase">Last 30 Days</h4>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-gray-400">0%</span>
              <div className="flex gap-0.5">
                <div className="w-2 h-2 bg-gray-100 rounded-sm" />
                <div className="w-2 h-2 bg-red-400 rounded-sm" />
                <div className="w-2 h-2 bg-orange-400 rounded-sm" />
                <div className="w-2 h-2 bg-yellow-400 rounded-sm" />
                <div className="w-2 h-2 bg-green-400 rounded-sm" />
                <div className="w-2 h-2 bg-green-500 rounded-sm" />
              </div>
              <span className="text-gray-400">100%</span>
            </div>
          </div>
          
          {/* Simple calendar grid */}
          <div className="flex flex-wrap gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`
                  w-[calc((100%-7*4px)/10)] 
                  aspect-square 
                  ${day.colorClass} 
                  rounded-sm 
                  flex items-center justify-center 
                  text-[8px] font-medium 
                  ${day.colorClass === 'bg-gray-100' ? 'text-gray-600' : 'text-white'}
                  ${day.isToday ? 'ring-2 ring-blue-600' : ''}
                  hover:opacity-80 transition-opacity cursor-pointer
                `}
                title={`Day ${day.day}`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}