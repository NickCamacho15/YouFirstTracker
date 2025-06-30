import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Target, Zap, BookOpen } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Post {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  user: {
    displayName: string;
  };
}

interface FeedPostProps {
  post: Post;
}

export function FeedPost({ post }: FeedPostProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case "goal":
        return <Target className="w-3 h-3" />;
      case "micro-goal":
        return <Zap className="w-3 h-3" />;
      case "habit":
        return <Sparkles className="w-3 h-3" />;
      case "reflection":
        return <BookOpen className="w-3 h-3" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const getPostColor = (type: string) => {
    switch (type) {
      case "goal":
        return "bg-blue-100 text-blue-600";
      case "micro-goal":
        return "bg-green-100 text-green-600";
      case "habit":
        return "bg-purple-100 text-purple-600";
      case "reflection":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "goal":
        return "Goal";
      case "micro-goal":
        return "Micro-Goal";
      case "habit":
        return "Habit";
      case "reflection":
        return "Reflection";
      default:
        return "Update";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Post Type Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getPostColor(post.type)}`}>
            {getPostIcon(post.type)}
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-primary">{post.user.displayName}</span>
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel(post.type)}
              </Badge>
            </div>
            
            <p className="text-primary text-sm mb-2">{post.message}</p>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-red-500">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-yellow-500">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
