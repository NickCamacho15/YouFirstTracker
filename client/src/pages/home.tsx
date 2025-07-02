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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">.uoY</h1>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Home</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Circles - Stories Style */}
        {following.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              {(following as Following[]).map((follow) => (
                <ProfileCircle
                  key={follow.id}
                  user={follow.following}
                  onClick={() => handleProfileClick(follow.following.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Timeline Feed */}
        <div className="space-y-4">
          {timelinePosts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to your timeline!</h3>
              <p className="text-gray-600">
                Follow other users to see their progress and milestones here.
              </p>
            </div>
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