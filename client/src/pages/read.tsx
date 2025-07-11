import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingTimer } from "@/components/reading/reading-timer";
import { BookOpen, Clock, TrendingUp, Brain, Smartphone, History, Lightbulb, Plus, Trophy } from "lucide-react";
import { ReadingList } from "@/components/reading/reading-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReadingSession {
  id: number;
  bookTitle: string;
  startTime: string;
  endTime: string;
  reflection?: string;
  createdAt: string;
}

export default function MindPage() {
  const [activeTab, setActiveTab] = useState("reading");
  const [readingSubTab, setReadingSubTab] = useState("list");
  const [showAddInsight, setShowAddInsight] = useState(false);
  const [newInsight, setNewInsight] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: readingSessions = [], isLoading } = useQuery({
    queryKey: ["/api/reading-sessions"],
  });

  const { data: readingList = [] } = useQuery({
    queryKey: ["/api/reading-list"],
  });

  const { data: insights = [] } = useQuery({
    queryKey: ["/api/insights"],
  });

  const addInsightMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await apiRequest("POST", "/api/insights", {
        title: "Reading Insight",
        content: data.content,
        category: "reflection"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      setNewInsight("");
      setShowAddInsight(false);
      toast({ title: "Insight added!", description: "Your reading insight has been saved." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add insight",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  const totalMinutes = (readingSessions as ReadingSession[]).reduce((total, session) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return total + Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }, 0);

  const totalSessions = readingSessions.length;
  const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const booksCompleted = (readingList as any[]).filter(book => book.isCompleted).length;

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" />
            Mind Training
          </h1>
          <p className="text-muted-foreground">
            Optimize your mental well-being through reading, meditation, and mindful technology use
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="meditation" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Meditation
            </TabsTrigger>
            <TabsTrigger value="distraction" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Distraction
            </TabsTrigger>
          </TabsList>

          {/* Reading Tab */}
          <TabsContent value="reading" className="mt-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="bg-background border shadow-md shadow-blue-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
                  <Clock className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-4xl font-bold text-foreground">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
                  <p className="text-sm text-muted-foreground">
                    All sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background border shadow-md shadow-green-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
                  <BookOpen className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-4xl font-bold text-foreground">{totalSessions}</div>
                  <p className="text-sm text-muted-foreground">
                    Completed
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background border shadow-md shadow-purple-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Time</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-4xl font-bold text-foreground">{averageSession}m</div>
                  <p className="text-sm text-muted-foreground">
                    Per session
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background border shadow-md shadow-orange-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Books Completed</CardTitle>
                  <Brain className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-4xl font-bold text-foreground">{booksCompleted}</div>
                  <p className="text-sm text-muted-foreground">
                    Finished
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reading Timer */}
            <div className="mb-8">
              <ReadingTimer readingSessions={readingSessions as ReadingSession[]} />
            </div>

            {/* Reading Content Tabs */}
            <Tabs value={readingSubTab} onValueChange={setReadingSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>

              {/* List Tab */}
              <TabsContent value="list" className="mt-4">
                <ReadingList />
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wider">Completed Books</h3>
                  {(readingList as any[]).filter(book => book.isCompleted).length === 0 ? (
                    <Card className="p-4 shadow-sm">
                      <p className="text-center text-muted-foreground text-sm">No completed books yet. Check off books from your list as you finish them!</p>
                    </Card>
                  ) : (
                    <div className="grid gap-2">
                      {(readingList as any[])
                        .filter(book => book.isCompleted)
                        .map((book) => (
                          <Card key={book.id} className="p-3 hover:shadow-md transition-shadow bg-white border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-foreground">{book.title}</h4>
                                {book.author && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                                )}
                                <p className="text-xs text-green-600 mt-1">
                                  Completed {book.completedAt ? new Date(book.completedAt).toLocaleDateString() : 'recently'}
                                </p>
                              </div>
                              <Trophy className="w-4 h-4 text-green-500" />
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="mt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Reading Insights</h3>
                    <Button 
                      onClick={() => setShowAddInsight(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Insight
                    </Button>
                  </div>
                  
                  {insights.length === 0 ? (
                    <Card className="p-6">
                      <p className="text-center text-muted-foreground">No insights yet. Add your first insight from your reading!</p>
                    </Card>
                  ) : (
                    (insights as any[]).map((insight) => (
                      <Card key={insight.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-foreground">{insight.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(insight.createdAt).toLocaleDateString()} at {new Date(insight.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )).reverse()
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Meditation Tab */}
          <TabsContent value="meditation" className="mt-6">
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Meditation Tracking</h3>
              <p className="text-gray-600">Coming soon - Track your meditation sessions and mindfulness practice</p>
            </div>
          </TabsContent>

          {/* Distraction Tab */}
          <TabsContent value="distraction" className="mt-6">
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Tracking</h3>
              <p className="text-gray-600">Coming soon - Monitor and reduce your social media usage</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Insight Dialog */}
      <Dialog open={showAddInsight} onOpenChange={setShowAddInsight}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reading Insight</DialogTitle>
            <DialogDescription>
              Capture a valuable insight or reflection from your reading
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="insight">Insight</Label>
              <Textarea
                id="insight"
                placeholder="What did you learn? What resonated with you?"
                value={newInsight}
                onChange={(e) => setNewInsight(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddInsight(false);
                  setNewInsight("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newInsight.trim()) {
                    addInsightMutation.mutate({ content: newInsight.trim() });
                  }
                }}
                disabled={!newInsight.trim() || addInsightMutation.isPending}
              >
                {addInsightMutation.isPending ? "Adding..." : "Add Insight"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}