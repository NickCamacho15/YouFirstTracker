import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Clock, Target, Activity } from 'lucide-react';

const TrainingAnalytics: React.FC = () => {
  const [timeView, setTimeView] = useState<'week' | 'month' | 'year'>('week');

  // Analytics data will be populated from actual workout data
  const overviewStats = [
    { title: 'Completion Rate', value: '0%', change: 'No data yet', icon: Target },
    { title: 'Workouts Completed', value: '0', change: 'Start tracking', icon: Activity },
    { title: 'Time Spent This Week', value: '0 hrs', change: 'Begin your journey', icon: Clock },
    { title: 'Avg. Volume Increase', value: '0%', change: 'Track progress', icon: TrendingUp }
  ];

  const weeklyProgressData: any[] = [];
  const muscleGroupData: any[] = [];
  const strengthProgressData: any[] = [];
  const volumeData: any[] = [];
  const workoutHistory: any[] = [];

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Training Analytics</h2>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="text-sm">Progress</TabsTrigger>
            <TabsTrigger value="volume" className="text-sm">Volume</TabsTrigger>
            <TabsTrigger value="history" className="text-sm">Workout History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                      <stat.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-green-600">{stat.change}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress Chart */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyProgressData}>
                        <XAxis 
                          dataKey="week" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis hide />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Muscle Group Focus Chart */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Muscle Group Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={muscleGroupData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {muscleGroupData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Strength Progression</h3>
              <p className="text-sm text-gray-600 mb-4">Tracking your strength gains over the 4-week period</p>
              
              {/* Time View Toggle */}
              <div className="flex gap-2 mb-6">
                {(['week', 'month', 'year'] as const).map((view) => (
                  <Button
                    key={view}
                    variant={timeView === view ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeView(view)}
                    className="capitalize"
                  >
                    {view}
                  </Button>
                ))}
              </div>

              {/* Multi-line Chart */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={strengthProgressData}>
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis hide />
                        <Line 
                          type="monotone" 
                          dataKey="squat" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="deadlift" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="benchpress" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pullup" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Volume Tab */}
          <TabsContent value="volume" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Training Volume by Week</h3>
              <p className="text-sm text-gray-600 mb-4">Total volume load across different training weeks</p>
              
              {/* Time View Toggle */}
              <div className="flex gap-2 mb-6">
                {(['week', 'month', 'year'] as const).map((view) => (
                  <Button
                    key={view}
                    variant={timeView === view ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeView(view)}
                    className="capitalize"
                  >
                    {view}
                  </Button>
                ))}
              </div>

              {/* Bar Chart */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData} barCategoryGap="20%">
                        <XAxis 
                          dataKey="period" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis hide />
                        <Bar 
                          dataKey="volume" 
                          fill="#06b6d4" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workout History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Workout History</h3>
              <p className="text-sm text-gray-600 mb-6">View and access your past workout templates</p>
              
              {/* Workout List */}
              <Card className="border border-gray-200">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {workoutHistory.map((workout, index) => (
                      <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-900">{workout.name}</h4>
                          <p className="text-sm text-gray-600">{workout.dateRange}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainingAnalytics;