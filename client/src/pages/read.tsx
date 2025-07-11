import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingTimer } from "@/components/reading/reading-timer";
import { BookOpen, Clock, TrendingUp, Brain, Smartphone } from "lucide-react";
import { ReadingList } from "@/components/reading/reading-list";
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
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Time</CardTitle>
                  <Clock className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold text-blue-800">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
                  <p className="text-sm text-blue-600 font-medium">
                    All sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Sessions</CardTitle>
                  <BookOpen className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold text-green-800">{totalSessions}</div>
                  <p className="text-sm text-green-600 font-medium">
                    Completed
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Average</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-3xl font-bold text-purple-800">{averageSession}m</div>
                  <p className="text-sm text-purple-600 font-medium">
                    Per session
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reading Timer */}
            <div className="mb-8">
              <ReadingTimer readingSessions={readingSessions as ReadingSession[]} />
            </div>

            {/* Reading List */}
            <div className="mb-8">
              <ReadingList />
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