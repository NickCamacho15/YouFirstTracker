import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Target, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressAnalyticsProps {
  className?: string;
}

export default function ProgressAnalytics({ className }: ProgressAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<"1month" | "6months" | "1year">("6months");

  // Generate sample data for different timeframes
  const generateData = (timeframe: string) => {
    const now = new Date();
    const dataPoints = timeframe === "1month" ? 4 : timeframe === "6months" ? 24 : 52;
    const interval = timeframe === "1month" ? 7 : timeframe === "6months" ? 7 : 7; // days
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (dataPoints - 1 - i) * interval);
      
      const weekNumber = dataPoints - i;
      const baseValues = {
        benchPress: 225 + (i * 2) + Math.random() * 10,
        squat: 315 + (i * 3) + Math.random() * 15,
        clean: 185 + (i * 1.5) + Math.random() * 8,
        overheadPress: 135 + (i * 1) + Math.random() * 5,
      };
      
      return {
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(timeframe === "1year" && { year: '2-digit' })
        }),
        weekNumber,
        benchPress: Math.round(baseValues.benchPress),
        squat: Math.round(baseValues.squat),
        clean: Math.round(baseValues.clean),
        overheadPress: Math.round(baseValues.overheadPress),
        totalVolume: Math.round(
          (baseValues.benchPress * 4 + baseValues.squat * 5 + baseValues.clean * 3 + baseValues.overheadPress * 4) * 3
        ),
      };
    });
  };

  const data = generateData(timeframe);

  const exercises = [
    { key: "benchPress", name: "Bench Press", color: "#3b82f6" },
    { key: "squat", name: "Squat", color: "#10b981" },
    { key: "clean", name: "Clean", color: "#f59e0b" },
    { key: "overheadPress", name: "Overhead Press", color: "#ef4444" },
  ];

  const timeframeOptions = [
    { value: "1month", label: "1 Month" },
    { value: "6months", label: "6 Months" },
    { value: "1year", label: "1 Year" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Weekly Volume Progress */}
      <Card className="border border-blue-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
              Weekly Volume Progress
            </CardTitle>
            <div className="flex space-x-1">
              {timeframeOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={timeframe === option.value ? "default" : "outline"}
                  onClick={() => setTimeframe(option.value as typeof timeframe)}
                  className="text-xs px-2 py-1"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={10}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="totalVolume" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Exercise Progress */}
      <Card className="border border-blue-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
            Exercise Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={10}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              {exercises.map((exercise) => (
                <Line
                  key={exercise.key}
                  type="monotone"
                  dataKey={exercise.key}
                  stroke={exercise.color}
                  strokeWidth={2}
                  dot={{ fill: exercise.color, strokeWidth: 2, r: 2 }}
                  activeDot={{ r: 3, fill: exercise.color }}
                  name={exercise.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex justify-center mt-3">
            <div className="grid grid-cols-2 gap-3">
              {exercises.map((exercise) => (
                <div key={exercise.key} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: exercise.color }}
                  />
                  <span className="text-xs text-gray-600">{exercise.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}