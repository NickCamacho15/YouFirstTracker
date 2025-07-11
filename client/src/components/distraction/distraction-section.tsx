import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Smartphone, TrendingUp, Calendar, Instagram, Twitter, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { SiTiktok, SiSnapchat } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScreenTimeEntry {
  id: number;
  userId: number;
  platform: string;
  timeMinutes: number;
  date: string;
  createdAt: string;
}

interface PlatformTime {
  [platform: string]: {
    hours: string;
    minutes: string;
  };
}

interface DayData {
  [day: string]: PlatformTime;
}

export default function DistractionSection() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [dayData, setDayData] = useState<DayData>({});
  const [activeDay, setActiveDay] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load screen time entries
  const { data: entries = [] } = useQuery({
    queryKey: ["/api/screen-time/entries"],
  });

  // Get week days
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay()); // Start on Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Set active day to today on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setActiveDay(today);
  }, []);

  // Initialize day data from entries
  useEffect(() => {
    const newDayData: DayData = {};
    
    (entries as ScreenTimeEntry[]).forEach(entry => {
      const date = entry.date;
      if (!newDayData[date]) {
        newDayData[date] = {};
      }
      
      const hours = Math.floor(entry.timeMinutes / 60);
      const minutes = entry.timeMinutes % 60;
      
      newDayData[date][entry.platform] = {
        hours: hours.toString(),
        minutes: minutes.toString()
      };
    });
    
    setDayData(newDayData);
  }, [entries]);

  // Create or update screen time entry
  const saveEntryMutation = useMutation({
    mutationFn: async (data: { platform: string; timeMinutes: number; date: string }) => {
      const response = await apiRequest("POST", "/api/screen-time/entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screen-time/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/screen-time/stats"] });
    },
  });

  const platforms = [
    { 
      name: "Instagram", 
      icon: Instagram, 
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
    },
    { 
      name: "TikTok", 
      icon: SiTiktok, 
      color: "from-black to-red-500",
      bgColor: "bg-gradient-to-br from-gray-50 to-red-50 border-gray-200"
    },
    { 
      name: "Snapchat", 
      icon: SiSnapchat, 
      color: "from-yellow-400 to-yellow-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
    },
    { 
      name: "X", 
      icon: Twitter, 
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
    }
  ];

  const handleTimeChange = (date: string, platform: string, field: 'hours' | 'minutes', value: string) => {
    const newData = { ...dayData };
    if (!newData[date]) {
      newData[date] = {};
    }
    if (!newData[date][platform]) {
      newData[date][platform] = { hours: '', minutes: '' };
    }
    
    newData[date][platform][field] = value;
    setDayData(newData);

    // Auto-save when value changes
    const hours = parseInt(field === 'hours' ? value : newData[date][platform].hours) || 0;
    const minutes = parseInt(field === 'minutes' ? value : newData[date][platform].minutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes > 0) {
      saveEntryMutation.mutate({
        platform,
        timeMinutes: totalMinutes,
        date
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate stats for calendar
  const calculateDayTotal = (date: string) => {
    const dayEntries = (entries as ScreenTimeEntry[]).filter(e => e.date === date);
    return dayEntries.reduce((sum, entry) => sum + entry.timeMinutes, 0);
  };

  const getCalendarColor = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100";
    if (minutes < 60) return "bg-green-100 border-green-300";
    if (minutes < 120) return "bg-yellow-100 border-yellow-300";
    if (minutes < 180) return "bg-orange-100 border-orange-300";
    return "bg-red-100 border-red-300";
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Track Your Social Media Time
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newWeek = new Date(currentWeek);
              newWeek.setDate(currentWeek.getDate() - 7);
              setCurrentWeek(newWeek);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm font-medium px-2">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newWeek = new Date(currentWeek);
              newWeek.setDate(currentWeek.getDate() + 7);
              setCurrentWeek(newWeek);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Tabs */}
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-cols-7 w-full">
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <TabsTrigger 
                key={dateStr} 
                value={dateStr}
                className={`text-xs ${isToday ? 'font-bold' : ''}`}
              >
                <div>
                  <div>{dayNames[idx].slice(0, 3)}</div>
                  <div className="text-xs">{day.getDate()}</div>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {weekDays.map(day => {
          const dateStr = day.toISOString().split('T')[0];
          
          return (
            <TabsContent key={dateStr} value={dateStr} className="mt-6">
              <div className="space-y-4">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const timeData = dayData[dateStr]?.[platform.name] || { hours: '', minutes: '' };
                  
                  return (
                    <Card key={platform.name} className={`${platform.bgColor} shadow-md`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-lg text-gray-900">{platform.name}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div>
                              <Label htmlFor={`${platform.name}-hours`} className="text-xs text-gray-600">Hours</Label>
                              <Input
                                id={`${platform.name}-hours`}
                                type="number"
                                value={timeData.hours}
                                onChange={(e) => handleTimeChange(dateStr, platform.name, 'hours', e.target.value)}
                                className="w-16 h-8 text-center"
                                min="0"
                                max="24"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${platform.name}-minutes`} className="text-xs text-gray-600">Minutes</Label>
                              <Input
                                id={`${platform.name}-minutes`}
                                type="number"
                                value={timeData.minutes}
                                onChange={(e) => handleTimeChange(dateStr, platform.name, 'minutes', e.target.value)}
                                className="w-16 h-8 text-center"
                                min="0"
                                max="59"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Calendar View */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            Social Media Time Wasted This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border rounded"></div>
              <span>No usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>&lt;1hr</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>1-2hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>2-3hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>3hrs+</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Calendar grid for current month */}
            {(() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              const startOffset = firstDay.getDay();
              const daysInMonth = lastDay.getDate();
              
              const cells = [];
              
              // Empty cells for offset
              for (let i = 0; i < startOffset; i++) {
                cells.push(<div key={`empty-${i}`} className="aspect-square"></div>);
              }
              
              // Days of month
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(today.getFullYear(), today.getMonth(), day);
                const dateStr = date.toISOString().split('T')[0];
                const totalMinutes = calculateDayTotal(dateStr);
                const isToday = day === today.getDate();
                
                cells.push(
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center text-xs font-medium rounded border ${getCalendarColor(totalMinutes)} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-center">
                      <div>{day}</div>
                      {totalMinutes > 0 && (
                        <div className="text-[10px] mt-0.5">{formatTime(totalMinutes)}</div>
                      )}
                    </div>
                  </div>
                );
              }
              
              return cells;
            })()}
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">
                Total time wasted this month: {formatTime((entries as ScreenTimeEntry[]).reduce((sum, e) => sum + e.timeMinutes, 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}