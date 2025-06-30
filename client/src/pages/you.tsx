import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FeedPost } from "@/components/community/feed-post";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Mic, Camera, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  user: {
    displayName: string;
  };
}

export default function YouPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'text' | 'audio' | 'video'>('text');
  const [postContent, setPostContent] = useState('');
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { type: string; message: string }) => {
      return apiRequest("/api/posts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setPostContent('');
      setShowRecordDialog(false);
      toast({
        title: "Success",
        description: "Your post has been shared!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleRecord = (type: 'text' | 'audio' | 'video') => {
    setRecordingType(type);
    setShowRecordDialog(true);
  };

  const handleSubmitPost = () => {
    if (!postContent.trim()) return;
    
    const typeLabels = {
      text: 'reflection',
      audio: 'voice_note', 
      video: 'video_update'
    };
    
    createPostMutation.mutate({
      type: typeLabels[recordingType],
      message: postContent,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading your timeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-12 h-12 bg-accent">
              <AvatarFallback className="text-white text-lg font-medium">
                {user?.displayName ? getInitials(user.displayName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Timeline</h1>
              <p className="text-muted-foreground">Share your journey and celebrate wins</p>
            </div>
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Welcome to Your Timeline!</h3>
                  <p className="text-muted-foreground mb-4">
                    This is where your achievements and reflections will appear.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete goals, habits, or hit the record button below to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            posts.map((post: Post) => (
              <FeedPost key={post.id} post={post} />
            ))
          )}
        </div>
      </div>

      {/* Instagram-style Record Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRecord('text')}
            className="rounded-full p-3"
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleRecord('text')}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Journey</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={recordingType === 'text' ? 'default' : 'outline'}
                    onClick={() => setRecordingType('text')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Text
                  </Button>
                  <Button
                    variant={recordingType === 'audio' ? 'default' : 'outline'}
                    onClick={() => setRecordingType('audio')}
                    className="flex items-center gap-2"
                    disabled
                  >
                    <Mic className="w-4 h-4" />
                    Audio
                  </Button>
                  <Button
                    variant={recordingType === 'video' ? 'default' : 'outline'}
                    onClick={() => setRecordingType('video')}
                    className="flex items-center gap-2"
                    disabled
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Share your thoughts, wins, or reflections..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[120px]"
                />
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowRecordDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitPost}
                    disabled={!postContent.trim() || createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? 'Sharing...' : 'Share'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRecord('audio')}
            className="rounded-full p-3"
            disabled
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}