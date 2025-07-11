import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Smartphone, TrendingUp, Calendar, Instagram, Twitter, ChevronLeft, ChevronRight, AlertCircle, X, DollarSign, Users, Briefcase } from "lucide-react";
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
  const [hiddenPlatforms, setHiddenPlatforms] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenPlatforms');
    return saved ? JSON.parse(saved) : [];
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load screen time entries
  const { data: entries = [] } = useQuery({
    queryKey: ["/api/screen-time/entries"],
  });

  // Load screen time stats
  const { data: stats } = useQuery({
    queryKey: ["/api/screen-time/stats"],
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
  };

  const handleBlur = (date: string, platform: string) => {
    const timeData = dayData[date]?.[platform];
    if (!timeData) return;

    const hours = parseInt(timeData.hours) || 0;
    const minutes = parseInt(timeData.minutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 0) {
      saveEntryMutation.mutate({
        platform,
        timeMinutes: totalMinutes,
        date
      });
    }
  };

  const togglePlatform = (platformName: string) => {
    const newHidden = hiddenPlatforms.includes(platformName)
      ? hiddenPlatforms.filter(p => p !== platformName)
      : [...hiddenPlatforms, platformName];
    
    setHiddenPlatforms(newHidden);
    localStorage.setItem('hiddenPlatforms', JSON.stringify(newHidden));
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

  // Calculate total time wasted
  const totalMinutes = (entries as ScreenTimeEntry[]).reduce((sum, e) => sum + e.timeMinutes, 0);
  const totalHours = totalMinutes / 60;
  const workWeeks = Math.floor(totalHours / 40);
  const workDays = Math.floor((totalHours % 40) / 8);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-xl font-bold">{formatTime(stats?.totalTime || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Daily Average</p>
                <p className="text-xl font-bold">{formatTime(stats?.avgDaily || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                {platforms.filter(p => !hiddenPlatforms.includes(p.name)).map((platform) => {
                  const Icon = platform.icon;
                  const timeData = dayData[dateStr]?.[platform.name] || { hours: '', minutes: '' };
                  
                  return (
                    <Card key={platform.name} className={`${platform.bgColor} shadow-md`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-base text-gray-900">{platform.name}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div>
                              <Label htmlFor={`${platform.name}-hours`} className="text-xs text-gray-600">Hr</Label>
                              <Input
                                id={`${platform.name}-hours`}
                                type="number"
                                value={timeData.hours}
                                onChange={(e) => handleTimeChange(dateStr, platform.name, 'hours', e.target.value)}
                                onBlur={() => handleBlur(dateStr, platform.name)}
                                className="w-14 h-8 text-center text-sm"
                                min="0"
                                max="24"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${platform.name}-minutes`} className="text-xs text-gray-600">Min</Label>
                              <Input
                                id={`${platform.name}-minutes`}
                                type="number"
                                value={timeData.minutes}
                                onChange={(e) => handleTimeChange(dateStr, platform.name, 'minutes', e.target.value)}
                                onBlur={() => handleBlur(dateStr, platform.name)}
                                className="w-14 h-8 text-center text-sm"
                                min="0"
                                max="59"
                                placeholder="0"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 ml-2"
                              onClick={() => togglePlatform(platform.name)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {hiddenPlatforms.length > 0 && (
                  <div className="text-center text-sm text-gray-500">
                    Hidden apps: {hiddenPlatforms.join(', ')} 
                    <Button 
                      variant="link" 
                      className="ml-2 p-0 h-auto text-blue-600"
                      onClick={() => {
                        setHiddenPlatforms([]);
                        localStorage.removeItem('hiddenPlatforms');
                      }}
                    >
                      Show all
                    </Button>
                  </div>
                )}
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
            Social Media Time This Month
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
        </CardContent>
      </Card>

      {/* Opportunity Cost Table */}
      <Card className="shadow-lg border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            The True Cost of Your Digital Distraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Work Time Lost */}
            <div className="p-3 bg-white rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-sm">Work Time Lost</h4>
              </div>
              <p className="text-lg">
                {workWeeks > 0 && (
                  <span className="font-bold text-red-700">{workWeeks} full work week{workWeeks > 1 ? 's' : ''}</span>
                )}
                {workWeeks > 0 && workDays > 0 && ' and '}
                {workDays > 0 && (
                  <span className="font-bold text-red-700">{workDays} work day{workDays > 1 ? 's' : ''}</span>
                )}
                {workWeeks === 0 && workDays === 0 && (
                  <span className="text-gray-600">Less than a work day</span>
                )}
              </p>
            </div>

            {/* Money Lost */}
            <div className="p-3 bg-white rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-sm">Income Opportunity Lost</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">$20/hour</p>
                  <p className="text-lg font-bold text-red-700">${Math.round(totalHours * 20).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">$50/hour</p>
                  <p className="text-lg font-bold text-red-700">${Math.round(totalHours * 50).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">$100/hour</p>
                  <p className="text-lg font-bold text-red-700">${Math.round(totalHours * 100).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Time with Friends/Family Lost */}
            <div className="p-3 bg-white rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-sm">Quality Time Lost</h4>
              </div>
              <p className="text-sm">
                Instead of scrolling, you could have had:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <span className="font-semibold">{Math.floor(totalHours / 2)}</span> meaningful conversations</li>
                <li>• <span className="font-semibold">{Math.floor(totalHours / 3)}</span> family dinners</li>
                <li>• <span className="font-semibold">{Math.floor(totalHours / 1.5)}</span> workout sessions</li>
                <li>• <span className="font-semibold">{Math.floor(totalHours / 8)}</span> full nights of sleep</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm font-medium text-red-700">
                Total time on social media: <span className="text-lg font-bold">{formatTime(totalMinutes)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}