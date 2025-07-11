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

  const createInsightMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string }) => {
      const response = await apiRequest("POST", "/api/insights", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
    },
  });

  const handleReflectionSubmit = (reflection: string) => {
    if (!sessionData) return;

    createSessionMutation.mutate({
      bookTitle: sessionData.bookTitle,
      startTime: sessionData.startTime.toISOString(),
      endTime: sessionData.endTime.toISOString(),
      reflection: reflection.trim() || undefined,
    });

    // Also save reflection as an insight if provided
    if (reflection.trim()) {
      createInsightMutation.mutate({
        title: `Reflection: ${sessionData.bookTitle}`,
        content: reflection.trim(),
        category: "reflection"
      });
    }

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
    <>
      <Card className="p-8 text-center bg-background border shadow-md shadow-orange-500/10">
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

      <ReflectionModal
        open={showReflectionModal}
        onOpenChange={setShowReflectionModal}
        onSubmit={handleReflectionSubmit}
        bookTitle={sessionData?.bookTitle || ""}
        duration={sessionData ? Math.floor((sessionData.endTime.getTime() - sessionData.startTime.getTime()) / 1000 / 60) : 0}
        isLoading={createSessionMutation.isPending}
      />
    </>
  );
}
