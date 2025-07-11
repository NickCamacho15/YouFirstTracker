import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReflectionModal } from "./reflection-modal";
import { Play, Square, Book, Clock } from "lucide-react";
import { format } from "date-fns";

interface ReadingSession {
  id: number;
  bookTitle: string;
  startTime: string;
  endTime: string;
  reflection?: string;
  createdAt: string;
}

interface ReadingTimerProps {
  readingSessions: ReadingSession[];
}

export function ReadingTimer({ readingSessions }: ReadingTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentBook, setCurrentBook] = useState("");
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [sessionData, setSessionData] = useState<{ bookTitle: string; startTime: Date; endTime: Date } | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (data: { bookTitle: string; startTime: string; endTime: string; reflection?: string }) => {
      const response = await apiRequest("POST", "/api/reading-sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-sessions"] });
      toast({ title: "Reading session saved!", description: "Great job on your reading progress!" });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const startReading = () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
    setElapsedTime(0);
    
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    toast({ title: "Reading session started", description: "Timer is now running. Happy reading!" });
  };

  const stopReading = () => {
    if (!startTimeRef.current || !isRunning) return;

    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const endTime = new Date();
    setSessionData({
      bookTitle: currentBook || "Reading Session",
      startTime: startTimeRef.current,
      endTime,
    });
    
    setShowReflectionModal(true);
  };

  const handleReflectionSubmit = (reflection: string) => {
    if (!sessionData) return;

    createSessionMutation.mutate({
      bookTitle: sessionData.bookTitle,
      startTime: sessionData.startTime.toISOString(),
      endTime: sessionData.endTime.toISOString(),
      reflection: reflection.trim() || undefined,
    });

    // Reset state
    setElapsedTime(0);
    setCurrentBook("");
    setSessionData(null);
    setShowReflectionModal(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Reading Timer */}
      <div className="lg:col-span-2">
        <Card className="p-8 mb-6 text-center bg-background border shadow-md shadow-orange-500/10">
          <h3 className="text-lg font-semibold text-foreground mb-6">Reading Session</h3>
          
          {/* Timer Display */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-foreground mb-2">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-muted-foreground font-medium">Current session</p>
          </div>

          {/* Book Input */}
          <div className="mb-6">
            <Input
              placeholder="Book title (optional)..."
              value={currentBook}
              onChange={(e) => setCurrentBook(e.target.value)}
              disabled={isRunning}
              className="max-w-sm mx-auto mb-4 text-center"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={startReading}
              disabled={isRunning}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Reading
            </Button>
            <Button
              onClick={stopReading}
              disabled={!isRunning}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100 px-8 py-3 font-medium"
            >
              <Square className="w-4 h-4 mr-2" />
              End & Reflect
            </Button>
          </div>
        </Card>

        {/* Recent Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-6">Recent Sessions</h3>
          
          <div className="space-y-4">
            {readingSessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reading sessions yet. Start your first session above!</p>
                </CardContent>
              </Card>
            ) : (
              readingSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-primary">{session.bookTitle}</h4>
                        <p className="text-muted-foreground text-sm">
                          {format(new Date(session.createdAt), "MMM d")} • {calculateDuration(session.startTime, session.endTime)} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-accent font-medium">
                          {calculateDuration(session.startTime, session.endTime)}m
                        </span>
                      </div>
                    </div>
                    
                    {session.reflection && (
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-muted-foreground text-sm mb-1">Reflection</p>
                        <p className="text-primary text-sm">{session.reflection}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reading Stats Sidebar */}
      <div className="lg:col-span-1">
        <Card className="p-6 mb-6">
          <h4 className="font-semibold text-primary mb-4">This Month</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total Time</span>
              <span className="font-semibold text-accent">
                {readingSessions.reduce((acc, session) => acc + calculateDuration(session.startTime, session.endTime), 0)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Sessions</span>
              <span className="font-semibold text-primary">{readingSessions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Average Session</span>
              <span className="font-semibold text-primary">
                {readingSessions.length > 0 
                  ? Math.round(readingSessions.reduce((acc, session) => acc + calculateDuration(session.startTime, session.endTime), 0) / readingSessions.length)
                  : 0} min
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h4 className="font-semibold text-primary mb-4">Reading Streak</h4>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-accent mb-2">{readingSessions.length}</div>
            <p className="text-muted-foreground text-sm">Sessions completed</p>
            <div className="mt-4 flex justify-center space-x-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < Math.min(readingSessions.length, 7) ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-primary mb-4">Quick Stats</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-accent" />
              <div>
                <p className="text-sm font-medium text-primary">Focus Time</p>
                <p className="text-xs text-muted-foreground">Improving daily</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Book className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-primary">Knowledge</p>
                <p className="text-xs text-muted-foreground">Expanding horizons</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ReflectionModal
        open={showReflectionModal}
        onOpenChange={setShowReflectionModal}
        onSubmit={handleReflectionSubmit}
        bookTitle={sessionData?.bookTitle || ""}
        duration={sessionData ? Math.floor((sessionData.endTime.getTime() - sessionData.startTime.getTime()) / 1000 / 60) : 0}
        isLoading={createSessionMutation.isPending}
      />
    </div>
  );
}
