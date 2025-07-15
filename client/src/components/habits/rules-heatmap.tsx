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
  const totalRules = rules.length;
  const completedToday = rules.filter(r => r.completedToday).length;
  const completionRate = totalRules > 0 ? Math.round((completedToday / totalRules) * 100) : 0;
  const avgStreak = totalRules > 0 ? Math.round(rules.reduce((acc, r) => acc + r.streak, 0) / totalRules) : 0;
  
  // Generate last 30 days
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Calculate value for each day
    let value = 0;
    if (rules.length > 0) {
      if (i === 0) {
        // Today - use actual completion
        value = completedToday / totalRules;
      } else {
        // Past days - simulate based on average streak
        const avgCompletion = avgStreak / 30;
        value = Math.min(1, avgCompletion + (Math.random() * 0.2 - 0.1));
      }
    }
    
    days.push({
      date: date,
      day: date.getDate(),
      value: Math.max(0, Math.min(1, value)),
      isToday: i === 0
    });
  }

  const getColorClass = (value: number) => {
    if (value >= 0.9) return 'bg-green-500';
    if (value >= 0.7) return 'bg-green-400';
    if (value >= 0.5) return 'bg-yellow-400';
    if (value >= 0.3) return 'bg-orange-400';
    if (value > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

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
          
          <div className="grid grid-cols-10 gap-0.5">
            {days.map((dayData, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-sm ${getColorClass(dayData.value)} relative cursor-pointer transition-all ${
                  dayData.isToday ? 'ring-2 ring-blue-600' : ''
                }`}
                title={`Day ${dayData.day}: ${Math.round(dayData.value * 100)}% completion`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white opacity-80">
                  {dayData.day}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}