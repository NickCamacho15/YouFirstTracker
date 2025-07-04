import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Target, Calendar, Activity } from "lucide-react";

interface WorkoutProgressProps {
  workouts: any[];
}

export function WorkoutProgress({ workouts }: WorkoutProgressProps) {
  
  // Mock data for progress charts (based on your screenshots)
  const rdlProgress = [
    { session: 'Session 1', weight: 210 },
    { session: 'Session 2', weight: 195 },
    { session: 'Session 3', weight: 225 },
    { session: 'Session 4', weight: 210 },
    { session: 'Session 5', weight: 230 },
    { session: 'Session 6', weight: 230 },
  ];

  const pullUpProgress = [
    { session: 'Session 1', reps: 16 },
    { session: 'Session 2', reps: 15.5 },
    { session: 'Session 3', reps: 15 },
    { session: 'Session 4', reps: 18 },
    { session: 'Session 5', reps: 20 },
  ];

  const nordicCurlsProgress = [
    { session: 'Session 1', time: 10 },
    { session: 'Session 2', time: 8.2 },
    { session: 'Session 3', time: 10 },
  ];

  const splitSquatProgress = [
    { session: 'Session 1', time: 72 },
    { session: 'Session 2', time: 76 },
    { session: 'Session 3', time: 90 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">+8%</div>
            <div className="text-sm text-gray-600">Strength Gain</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">PRs This Month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">3.2</div>
            <div className="text-sm text-gray-600">Avg/Week</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-600">Consistency</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RDL Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">RDL Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <AreaChart data={rdlProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip formatter={(value) => [`${value} lbs`, 'Weight']} />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pull Up Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pull Up Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <AreaChart data={pullUpProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip formatter={(value) => [`${value}`, 'Reps']} />
                  <Area 
                    type="monotone" 
                    dataKey="reps" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Nordic Curls Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nordic Curls Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <AreaChart data={nordicCurlsProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip formatter={(value) => [`${value}s`, 'Time']} />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* BB Split Squat Hold Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">BB Split Squat Hold Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <AreaChart data={splitSquatProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip formatter={(value) => [`${value}s`, 'Time']} />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Fitness Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium">Bench Press 225 lbs</h4>
                <p className="text-sm text-gray-600">Current: 205 lbs</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium">20 Pull-ups</h4>
                <p className="text-sm text-gray-600">Current: 18 reps</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">90%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium">Body Weight 175 lbs</h4>
                <p className="text-sm text-gray-600">Current: 173.1 lbs</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">99%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}