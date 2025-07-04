import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Dumbbell, TrendingUp } from "lucide-react";

interface WorkoutDashboardProps {
  workouts: any[];
}

export function WorkoutDashboard({ workouts }: WorkoutDashboardProps) {
  // Get recent workouts (last 5)
  const recentWorkouts = workouts.slice(0, 5);

  // Calculate streak (consecutive workout days)
  const calculateStreak = () => {
    if (workouts.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date);
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="space-y-6">
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{workouts.length}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {workouts.reduce((total, workout) => total + (workout.duration || 45), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Minutes</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
              <p className="text-gray-600">Start your fitness journey by logging your first workout!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <div key={workout.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Dumbbell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{workout.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(workout.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {workout.duration ? `${workout.duration}m` : '45m'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Keep Going!</h3>
          <p className="text-blue-100">
            {streak === 0 
              ? "Start your fitness journey today - every workout counts!"
              : streak === 1
              ? "Great start! One workout down, keep the momentum going."
              : `Amazing ${streak}-day streak! You're building serious momentum.`
            }
          </p>
        </CardContent>
      </Card>

    </div>
  );
}