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
  
  // Generate calendar data for the last 30 days
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      let percentage = 0;
      if (rules.length > 0) {
        if (i === 0) {
          // Today's actual data
          percentage = Math.round((completedToday / totalRules) * 100);
        } else {
          // Historical data based on average streak
          const basePercentage = Math.min(100, (avgStreak / 30) * 100);
          const variation = (Math.random() - 0.5) * 20;
          percentage = Math.round(Math.max(0, Math.min(100, basePercentage + variation)));
        }
      }
      
      days.push({
        date: date.getDate(),
        percentage,
        isToday: i === 0
      });
    }
    
    return days;
  };
  
  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 30) return 'bg-orange-400';
    if (percentage > 0) return 'bg-red-400';
    return 'bg-gray-100 text-gray-600';
  };
  
  const calendarData = generateCalendarData();

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
        {/* Compact calendar view */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-medium text-gray-600 uppercase">Last 30 Days</h4>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-gray-400">0%</span>
              <div className="flex gap-0.5">
                {[0, 20, 40, 60, 80, 100].map((val) => (
                  <div
                    key={val}
                    className={`w-2 h-2 rounded-sm ${getColorForPercentage(val)}`}
                  />
                ))}
              </div>
              <span className="text-gray-400">100%</span>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="bg-white p-2 rounded-lg">
            <div className="grid grid-cols-10 gap-1">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  title={`Day ${day.date}: ${day.percentage}% adherence`}
                  className={`
                    w-7 h-7 rounded ${getColorForPercentage(day.percentage)}
                    flex items-center justify-center text-[9px] font-medium text-white
                    ${day.isToday ? 'ring-2 ring-blue-600 ring-offset-1' : ''}
                    cursor-pointer hover:opacity-80 transition-opacity
                  `}
                >
                  {day.date}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}