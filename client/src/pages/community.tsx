import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { FeedPost } from "@/components/community/feed-post";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunityPage() {
  const { data: posts = [] } = useQuery({
    queryKey: ["/api/posts"],
  });

  const filterPostsByType = (type: string) => {
    return posts.filter((post: any) => post.type === type);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-2">Community Feed</h2>
          <p className="text-muted-foreground">
            See what others are achieving and share your progress
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="goal">Goals</TabsTrigger>
            <TabsTrigger value="habit">Habits</TabsTrigger>
            <TabsTrigger value="reflection">Reflections</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No community posts yet. Complete some goals or habits to share your progress!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: any) => (
                  <FeedPost key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="goal">
            <div className="space-y-4">
              {filterPostsByType("goal").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No goal posts yet.</p>
                  </CardContent>
                </Card>
              ) : (
                filterPostsByType("goal").map((post: any) => (
                  <FeedPost key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="habit">
            <div className="space-y-4">
              {filterPostsByType("habit").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No habit posts yet.</p>
                  </CardContent>
                </Card>
              ) : (
                filterPostsByType("habit").map((post: any) => (
                  <FeedPost key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reflection">
            <div className="space-y-4">
              {filterPostsByType("reflection").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No reflection posts yet.</p>
                  </CardContent>
                </Card>
              ) : (
                filterPostsByType("reflection").map((post: any) => (
                  <FeedPost key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
