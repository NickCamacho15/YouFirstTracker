import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, BookOpen, Brain, Heart, Hammer, Smartphone, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttentionData {
  category: string;
  hours: number;
  type: 'build' | 'distract';
  color: string;
}

interface AttentionAuditProps {
  isCollapsed?: boolean;
}

export function AttentionAudit({ isCollapsed = false }: AttentionAuditProps) {
  const [currentWeekData, setCurrentWeekData] = useState<AttentionData[]>([
    { category: "Social Media", hours: 21, type: 'distract', color: "#ef4444" },
    { category: "Entertainment", hours: 14, type: 'distract', color: "#f97316" },
    { category: "News/Scrolling", hours: 8, type: 'distract', color: "#f59e0b" },
    { category: "Reading", hours: 7, type: 'build', color: "#10b981" },
    { category: "Learning", hours: 5, type: 'build', color: "#3b82f6" },
    { category: "Prayer/Reflection", hours: 3, type: 'build', color: "#8b5cf6" },
    { category: "Building/Creating", hours: 6, type: 'build', color: "#06b6d4" },
  ]);

  const [isEditingWeek, setIsEditingWeek] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState("Under 35h screen time");
  const [sundayReflection, setSundayReflection] = useState("");
  const { toast } = useToast();

  const totalDistract = currentWeekData.filter(d => d.type === 'distract').reduce((sum, d) => sum + d.hours, 0);
  const totalBuild = currentWeekData.filter(d => d.type === 'build').reduce((sum, d) => sum + d.hours, 0);
  const ratio = totalBuild / totalDistract;

  const getAttentionGrade = () => {
    if (ratio >= 1.5) return { grade: 'A+', color: 'text-green-600', message: 'Masterful attention allocation' };
    if (ratio >= 1.0) return { grade: 'A', color: 'text-green-500', message: 'Building more than consuming' };
    if (ratio >= 0.7) return { grade: 'B', color: 'text-blue-500', message: 'Good balance emerging' };
    if (ratio >= 0.4) return { grade: 'C', color: 'text-yellow-500', message: 'Room for improvement' };
    return { grade: 'D', color: 'text-red-500', message: 'Attention needs focus' };
  };

  const grade = getAttentionGrade();

  if (isCollapsed) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Eye className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Attention Audit</h3>
                <p className="text-xs text-muted-foreground">This week's focus</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${grade.color}`}>{grade.grade}</div>
              <div className="text-xs text-muted-foreground">
                {totalBuild}h build / {totalDistract}h distract
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Sunday Check-In: Who Did You Feed?</CardTitle>
              <p className="text-sm text-muted-foreground">Weekly attention audit and reflection</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingWeek(!isEditingWeek)}
          >
            <Target className="w-4 h-4 mr-1" />
            {isEditingWeek ? 'Save' : 'Edit Week'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* This Week's Grade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">Attention Grade</span>
            </div>
            <div className={`text-3xl font-bold ${grade.color}`}>{grade.grade}</div>
            <div className="text-xs text-muted-foreground">{grade.message}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Hammer className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Time Building</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{totalBuild}h</div>
            <div className="text-xs text-green-600">Reading, learning, creating</div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Time Taken</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{totalDistract}h</div>
            <div className="text-xs text-red-600">Social, entertainment, scrolling</div>
          </div>
        </div>

        {/* Visual Bar Comparison */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Input vs Investment Comparison</h3>
          <div className="space-y-3">
            {currentWeekData.map((item, index) => {
              const maxHours = Math.max(...currentWeekData.map(d => d.hours));
              const percentage = (item.hours / maxHours) * 100;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-right">
                    {item.category}
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg relative overflow-hidden">
                    <div 
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: item.color,
                        minWidth: item.hours > 0 ? '20px' : '0px'
                      }}
                    >
                      <span className="text-white text-xs font-semibold">
                        {item.hours}h
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`w-16 justify-center text-xs ${
                      item.type === 'build' 
                        ? 'border-green-200 text-green-700 bg-green-50' 
                        : 'border-red-200 text-red-700 bg-red-50'
                    }`}
                  >
                    {item.type === 'build' ? 'Build' : 'Distract'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">This Week's Attention Goal</h3>
              <p className="text-sm text-muted-foreground">{weeklyGoal}</p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Active Goal
            </Badge>
          </div>
        </div>

        {/* Sunday Reflection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Sunday Reflection</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3 italic">
              "Where your attention goes, energy flows and results show. 
              Reflect on who or what you fed with your attention this week."
            </p>
            <textarea
              placeholder="What patterns do you notice? What served you? What didn't? Who are you becoming through your attention choices?"
              value={sundayReflection}
              onChange={(e) => setSundayReflection(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Action Steps */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4">
          <h3 className="font-semibold mb-2">This Week's Focus</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Increase building time by 2 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">•</span>
              <span>Set phone to airplane mode during focused work</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">•</span>
              <span>Replace 1 hour of scrolling with reading</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}