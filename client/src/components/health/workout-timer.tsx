import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkoutTimerProps {
  currentWorkout?: string;
  currentBlocks?: string[];
}

export function WorkoutTimer({ currentWorkout = "Workout Session", currentBlocks = [] }: WorkoutTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sessionData, setSessionData] = useState<{ 
    workoutType: string; 
    startTime: Date; 
    endTime: Date; 
    duration: number;
    blocksCompleted: string[];
  } | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (data: { 
      startTime: string; 
      endTime: string; 
      duration: number;
      workoutType?: string; 
      notes?: string;
      blocksCompleted?: string[];
    }) => {
      const response = await apiRequest("POST", "/api/workout-sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions/stats"] });
      toast({ 
        title: "Workout session saved!", 
        description: "Great job on completing your workout!" 
      });
      // Reset state
      setElapsedTime(0);
      setSessionData(null);
      setShowSummaryModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const startWorkout = () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
    setElapsedTime(0);
    
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    toast({ 
      title: "Workout started", 
      description: "Timer is now running. Let's crush this workout!" 
    });
  };

  const stopWorkout = () => {
    if (!startTimeRef.current || !isRunning) return;

    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
    
    setSessionData({
      workoutType: currentWorkout,
      startTime: startTimeRef.current,
      endTime,
      duration,
      blocksCompleted: currentBlocks,
    });
    
    setShowSummaryModal(true);
  };

  const confirmSession = () => {
    if (!sessionData) return;

    createSessionMutation.mutate({
      startTime: sessionData.startTime.toISOString(),
      endTime: sessionData.endTime.toISOString(),
      duration: sessionData.duration,
      workoutType: sessionData.workoutType,
      blocksCompleted: sessionData.blocksCompleted,
    });
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  return (
    <>
      <Card className="p-8 text-center bg-background border shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-6">Workout Timer</h3>
        
        {/* Timer Display */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-foreground mb-2">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-muted-foreground font-medium">
            {currentWorkout}
          </p>
        </div>

        {/* Timer Controls */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={startWorkout}
            disabled={isRunning}
            size="lg"
            className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white px-8 py-6 text-lg font-medium"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Workout
          </Button>
          <Button
            onClick={stopWorkout}
            disabled={!isRunning}
            variant="outline"
            size="lg"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground px-8 py-6 text-lg"
          >
            <Square className="w-5 h-5 mr-2" />
            End Session
          </Button>
        </div>
      </Card>

      {/* Session Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Workout Complete!</DialogTitle>
            <DialogDescription>
              Review your session summary
            </DialogDescription>
          </DialogHeader>
          
          {sessionData && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workout Type:</span>
                  <span className="font-medium">{sessionData.workoutType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formatDuration(sessionData.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span className="font-medium">{format(sessionData.startTime, 'h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Time:</span>
                  <span className="font-medium">{format(sessionData.endTime, 'h:mm a')}</span>
                </div>
                {sessionData.blocksCompleted.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blocks Completed:</span>
                    <span className="font-medium">{sessionData.blocksCompleted.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSummaryModal(false);
                setElapsedTime(0);
                setSessionData(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSession}
              disabled={createSessionMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {createSessionMutation.isPending ? "Saving..." : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}