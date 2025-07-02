import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface ReadingStatsProps {
  readingSessions: any[];
  userProfile?: any;
  isPublicView?: boolean;
}

export function ReadingStats({ readingSessions, userProfile, isPublicView = false }: ReadingStatsProps) {
  // Calculate reading statistics
  const totalMinutes = readingSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalBooks = userProfile?.booksCompleted || 0;
  const currentBook = userProfile?.currentlyReading;
  const averageSessionLength = readingSessions.length > 0 ? Math.round(totalMinutes / readingSessions.length) : 0;
  
  // Get recent reading streak
  const recentSessions = readingSessions
    .filter(session => session.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  let currentStreak = 0;
  if (recentSessions.length > 0) {
    const today = new Date();
    let checkDate = today;
    
    for (const session of recentSessions) {
      const sessionDate = new Date(session.createdAt);
      const daysDiff = differenceInDays(checkDate, sessionDate);
      
      if (daysDiff <= 1) {
        currentStreak++;
        checkDate = sessionDate;
      } else {
        break;
      }
    }
  }

  // Calculate this month's progress
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthSessions = readingSessions.filter(session => {
    const sessionDate = new Date(session.createdAt);
    return sessionDate.getMonth() === thisMonth && sessionDate.getFullYear() === thisYear;
  });
  const thisMonthMinutes = thisMonthSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const monthlyGoal = 600; // 10 hours per month
  const monthlyProgress = (thisMonthMinutes / monthlyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reading Journey</h3>
          <p className="text-gray-600">
            {isPublicView ? 'Reading progress and achievements' : 'Your personal reading statistics'}
          </p>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
            <div className="text-sm text-gray-600">Total Reading</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalBooks}</div>
            <div className="text-sm text-gray-600">Books Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{averageSessionLength}m</div>
            <div className="text-sm text-gray-600">Avg Session</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            This Month's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{Math.floor(thisMonthMinutes / 60)}h {thisMonthMinutes % 60}m of 10h goal</span>
              <span className="font-medium text-gray-900">{Math.round(monthlyProgress)}%</span>
            </div>
            <Progress value={Math.min(monthlyProgress, 100)} className="h-2" />
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">
                {thisMonthSessions.length} sessions this month
              </div>
              {monthlyProgress >= 100 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Award className="w-3 h-3 mr-1" />
                  Goal Achieved!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currently Reading */}
      {currentBook && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Currently Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                📖
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{currentBook}</h4>
                <p className="text-sm text-gray-600">In progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorite Genres */}
      {userProfile?.favoriteGenres && userProfile.favoriteGenres.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Favorite Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userProfile.favoriteGenres.map((genre: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {readingSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session, index) => (
                <div key={session.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-gray-900">{session.bookTitle || 'Reading Session'}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(session.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{session.duration}m</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                </div>
              ))}
              {readingSessions.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">And {readingSessions.length - 5} more sessions...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}