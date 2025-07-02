import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: number;
  userId: number;
  type: string;
  message: string;
  relatedId: number | null;
  isPrivate: boolean;
  metadata: string | null;
  createdAt: string;
  user: {
    displayName: string;
  };
}

interface Following {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
  following: {
    id: number;
    displayName: string;
  };
}

function ProfileCircle({ user, onClick }: { user: { id: number; displayName: string }, onClick: () => void }) {
  const initials = user.displayName.split(' ').map(name => name[0]).join('').toUpperCase();
  
  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <div 
        className="relative cursor-pointer transform transition-transform hover:scale-105"
        onClick={onClick}
      >
        {/* Story ring */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
          <Avatar className="w-full h-full border-2 border-white">
            <AvatarFallback className="bg-gray-100 text-gray-800 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs text-gray-600 truncate max-w-[80px] text-center">
        {user.displayName}
      </span>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const timeAgo = new Date(post.createdAt).toLocaleDateString();
  const userInitials = post.user.displayName.split(' ').map(name => name[0]).join('').toUpperCase();

  const getPostIcon = () => {
    switch (post.type) {
      case 'habit':
        return '✅';
      case 'goal':
        return '🎯';
      case 'micro-goal':
        return '⭐';
      case 'reflection':
        return '💭';
      case 'milestone':
        return '🏆';
      default:
        return '📝';
    }
  };

  const getPostTypeLabel = () => {
    switch (post.type) {
      case 'habit':
        return 'Habit Completed';
      case 'goal':
        return 'Goal Achievement';
      case 'micro-goal':
        return 'Micro Goal';
      case 'reflection':
        return 'Reading Reflection';
      case 'milestone':
        return 'Milestone Unlocked';
      default:
        return 'Update';
    }
  };

  const renderMetrics = () => {
    try {
      const metadata = JSON.parse(post.metadata || '{}');
      
      if (metadata.achievement === 'reading_session_completed') {
        return (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800 text-sm">Reading Session Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Duration:</span>
                <span className="font-semibold text-purple-900">{metadata.readingDuration}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Book:</span>
                <span className="font-semibold text-purple-900 truncate">{metadata.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Date:</span>
                <span className="font-semibold text-purple-900">{new Date(metadata.sessionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Session:</span>
                <span className="font-semibold text-purple-900">#{metadata.sessionId}</span>
              </div>
            </div>
            {metadata.reflection && (
              <div className="mt-2 pt-2 border-t border-purple-200">
                <p className="text-sm text-purple-700 italic">"{metadata.reflection}"</p>
              </div>
            )}
          </div>
        );
      }

      if (metadata.achievement === 'goal_completed') {
        const daysTaken = metadata.dueDate 
          ? Math.floor((new Date(metadata.completionDate).getTime() - new Date(metadata.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        return (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 text-sm">Goal Achievement Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Completed:</span>
                <span className="font-semibold text-blue-900">{new Date(metadata.completionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Sub-tasks:</span>
                <span className="font-semibold text-blue-900">{metadata.microGoalsCompleted}/{metadata.totalMicroGoals}</span>
              </div>
              {metadata.dueDate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Due Date:</span>
                    <span className="font-semibold text-blue-900">{new Date(metadata.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Timeline:</span>
                    <span className={`font-semibold ${daysTaken <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {daysTaken <= 0 ? `${Math.abs(daysTaken)}d early` : `${daysTaken}d late`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }

      if (metadata.achievement === 'micro_goal_completed') {
        return (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800 text-sm">Micro-Goal Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Task:</span>
                <span className="font-semibold text-green-900 truncate">{metadata.microGoalTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Parent Goal:</span>
                <span className="font-semibold text-green-900 truncate">{metadata.parentGoalTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Completed:</span>
                <span className="font-semibold text-green-900">{new Date(metadata.completionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Progress:</span>
                <span className="font-semibold text-green-900">Step completed ✓</span>
              </div>
            </div>
          </div>
        );
      }

      // Habit completion metrics (if we add those later)
      if (metadata.achievement === 'habit_completed' || post.type === 'habit') {
        return (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800 text-sm">Habit Streak Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700">Streak:</span>
                <span className="font-semibold text-yellow-900">{metadata.streakDays || 'N/A'} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Category:</span>
                <span className="font-semibold text-yellow-900">{metadata.category || 'General'}</span>
              </div>
            </div>
          </div>
        );
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{post.user.displayName}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <span>{getPostIcon()}</span>
              <span>{getPostTypeLabel()}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">{post.message}</p>
          
          {/* Achievement Metrics */}
          {post.metadata && renderMetrics()}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:text-red-500">
            <Heart className="w-4 h-4" />
            <span className="text-sm">React</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="text-sm">Inspire</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  // Get timeline posts
  const { data: timelinePosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/timeline"],
  });

  // Get following list for profile circles
  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ["/api/following"],
  });

  const handleProfileClick = (userId: number) => {
    // Navigate to user's profile - for now just log
    console.log("Navigate to user profile:", userId);
  };

  if (postsLoading || followingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">.uoY</h1>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Home</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Profile Circles - Stories Style */}
        {following.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                {(following as Following[]).map((follow) => (
                  <ProfileCircle
                    key={follow.id}
                    user={follow.following}
                    onClick={() => handleProfileClick(follow.following.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline Feed */}
        <div className="space-y-6">
          {timelinePosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to your timeline!</h3>
                  <p className="text-muted-foreground">
                    Follow other users to see their progress and milestones here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            (timelinePosts as Post[]).map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}