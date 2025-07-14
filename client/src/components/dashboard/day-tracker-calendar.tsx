import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy, Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface WonDay {
  date: string;
  morningRoutineCompleted: boolean;
  eveningRoutineCompleted: boolean;
  tasksCompleted: boolean;
  workedOut: boolean;
  readCompleted: boolean;
  rulesAdhered: boolean;
  manuallyWon: boolean;
}

export function DayTrackerCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: wonDays = [] } = useQuery<WonDay[]>({
    queryKey: [`/api/won-days/${format(currentMonth, "yyyy-MM")}`],
  });

  const wonDayDates = new Set(wonDays.map(day => day.date));
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get current streak
  const currentStreak = calculateCurrentStreak(wonDays);
  const longestStreak = calculateLongestStreak(wonDays);
  
  const winDayMutation = useMutation({
    mutationFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      await apiRequest("/api/won-days", { 
        method: "POST", 
        body: { date: today, manuallyWon: true } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/won-days"] });
      toast({
        title: "Day Won!",
        description: "Congratulations on winning today!",
      });
    },
  });

  function calculateCurrentStreak(days: WonDay[]): number {
    if (days.length === 0) return 0;
    
    const sortedDays = [...days].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = startOfDay(new Date());
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = startOfDay(new Date(sortedDays[i].date));
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (dayDate.getTime() === startOfDay(expectedDate).getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateLongestStreak(days: WonDay[]): number {
    if (days.length === 0) return 0;
    
    const sortedDays = [...days].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1].date);
      const currDate = new Date(sortedDays[i].date);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Get starting day of week (0-6)
  const startDayOfWeek = monthStart.getDay();
  
  // Create empty cells for days before month starts
  const emptyCells = Array(startDayOfWeek).fill(null);

  return (
    <div className="space-y-3">
      {/* Calendar Card */}
      <Card className="bg-white/95 backdrop-blur border-gray-200 shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="p-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={`day-${index}`} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {monthDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isWon = wonDayDates.has(dateStr);
            const isPast = isBefore(day, startOfDay(new Date())) && !isToday(day);
            
            return (
              <div
                key={dateStr}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                  transition-all duration-200 relative
                  ${isToday(day) ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                  ${isWon 
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm" 
                    : isPast
                    ? "bg-gray-100 text-gray-400"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {format(day, "d")}
                {isWon && (
                  <Trophy className="w-3 h-3 absolute top-0.5 right-0.5 text-white/80" />
                )}
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Current Streak:</span>
            <span className="text-sm font-bold text-gray-900">{currentStreak} days</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">Best:</span>
            <span className="text-sm font-bold text-gray-900">{longestStreak} days</span>
          </div>
        </div>
      </Card>

      {/* Win Today Tile */}
      <Card className="bg-white shadow-sm p-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Win Today</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Morning & Evening • Tasks • Workout • Reading • Rules
          </p>
        </div>
      </Card>

      {/* I Won Today Button */}
      <Button
        onClick={() => winDayMutation.mutate()}
        disabled={winDayMutation.isPending || wonDayDates.has(format(new Date(), "yyyy-MM-dd"))}
        className={cn(
          "w-full h-12 text-base font-medium transition-all",
          wonDayDates.has(format(new Date(), "yyyy-MM-dd"))
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
        )}
      >
        {winDayMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : wonDayDates.has(format(new Date(), "yyyy-MM-dd")) ? (
          <>
            <Trophy className="w-5 h-5 mr-2" />
            Today Won!
          </>
        ) : (
          "I Won Today"
        )}
      </Button>
    </div>
  );
}