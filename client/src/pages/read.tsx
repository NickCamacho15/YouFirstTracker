import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingTimer } from "@/components/reading/reading-timer";
import { BookOpen, Clock, TrendingUp, Brain, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const { data: readingSessions = [], isLoading } = useQuery({
    queryKey: ["/api/reading-sessions"],
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reading Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
                  <p className="text-xs text-muted-foreground">
                    Across all sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reading Sessions</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Total completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Session</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageSession}m</div>
                  <p className="text-xs text-muted-foreground">
                    Per session
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reading Timer */}
            <div className="mb-8">
              <ReadingTimer readingSessions={readingSessions as ReadingSession[]} />
            </div>
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
    </div>
  );
}