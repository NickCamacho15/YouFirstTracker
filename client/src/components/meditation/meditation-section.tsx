import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Timer, BarChart3, Trophy, Flame, Target, Award, Star, Crown, Gem, Medal, Zap } from "lucide-react";

export function MeditationSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gongIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer states
  const [preparationTime, setPreparationTime] = useState(5); // in seconds
  const [intervalTime, setIntervalTime] = useState(5); // in minutes
  const [totalTime, setTotalTime] = useState(15); // in minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<"preparation" | "meditation" | "complete">("preparation");
  const [intervalsCompleted, setIntervalsCompleted] = useState(0);

  // Load meditation stats
  const { data: stats = { sessions: 0, streak: 0, totalTime: 0 } } = useQuery({
    queryKey: ["/api/meditation/stats"],
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["/api/meditation/milestones"],
  });

  // Create meditation session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { duration: number }) => {
      const response = await apiRequest("POST", "/api/meditation/sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meditation/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meditation/milestones"] });
      toast({ title: "Session complete!", description: "Your meditation has been logged." });
    },
  });

  // Play gong sound
  const playGong = () => {
    // Create a simple gong sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 110; // Low frequency for gong-like sound
    oscillator.type = "sine";
    
    // Envelope for gong sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const next = prev + 1;
          
          // Check phase transitions
          if (currentPhase === "preparation" && next >= preparationTime) {
            setCurrentPhase("meditation");
            playGong();
            return 0; // Reset for meditation phase
          }
          
          if (currentPhase === "meditation") {
            const totalMeditationSeconds = totalTime * 60;
            const intervalSeconds = intervalTime * 60;
            
            // Check for interval completion
            if (next > 0 && next % intervalSeconds === 0 && next < totalMeditationSeconds) {
              playGong();
              setIntervalsCompleted(Math.floor(next / intervalSeconds));
            }
            
            // Check for meditation completion
            if (next >= totalMeditationSeconds) {
              handleComplete();
              return next;
            }
          }
          
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentPhase, preparationTime, intervalTime, totalTime]);

  const handleComplete = () => {
    setCurrentPhase("complete");
    setIsRunning(false);
    
    // Repeating gong
    let gongCount = 0;
    gongIntervalRef.current = setInterval(() => {
      playGong();
      gongCount++;
      if (gongCount >= 3) { // Play 3 times then stop
        if (gongIntervalRef.current) {
          clearInterval(gongIntervalRef.current);
        }
      }
    }, 1500);
    
    // Log the session
    createSessionMutation.mutate({ duration: totalTime });
  };

  const handleBegin = () => {
    setIsRunning(true);
    setTimeElapsed(0);
    setCurrentPhase("preparation");
    setIntervalsCompleted(0);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setCurrentPhase("preparation");
    setIntervalsCompleted(0);
    
    if (gongIntervalRef.current) {
      clearInterval(gongIntervalRef.current);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress for circular timer
  const getProgress = () => {
    if (currentPhase === "preparation") {
      return (timeElapsed / preparationTime) * 100;
    } else if (currentPhase === "meditation") {
      return (timeElapsed / (totalTime * 60)) * 100;
    }
    return 100;
  };

  // Milestones data
  const allMilestones = [
    { id: 1, title: "First Session", description: "Complete your first meditation", sessions: 1, icon: Star, earned: stats.sessions >= 1 },
    { id: 2, title: "Week Warrior", description: "7 day streak", days: 7, icon: Flame, earned: stats.streak >= 7 },
    { id: 3, title: "Mindful Month", description: "30 day streak", days: 30, icon: Trophy, earned: stats.streak >= 30 },
    { id: 4, title: "Sacred 40", description: "40 day streak", days: 40, icon: Crown, earned: stats.streak >= 40 },
    { id: 5, title: "Quarter Master", description: "4 month streak", days: 120, icon: Gem, earned: stats.streak >= 120 },
    { id: 6, title: "10 Hour Club", description: "10 hours total", hours: 10, icon: Medal, earned: stats.totalTime >= 600 },
    { id: 7, title: "50 Sessions", description: "Complete 50 sessions", sessions: 50, icon: Award, earned: stats.sessions >= 50 },
    { id: 8, title: "100 Sessions", description: "Complete 100 sessions", sessions: 100, icon: Zap, earned: stats.sessions >= 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-white border shadow-sm">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.sessions}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{Math.floor(stats.totalTime / 60)}h</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Circular Timer */}
      <Card className="p-6 bg-slate-900 text-white">
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Background circles */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="90"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="60"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          
          {/* Progress circles */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            {/* Total time progress */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Timer controls */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="space-y-1 text-center">
              <div 
                className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-400/20 transition-colors"
                onClick={() => !isRunning && setPreparationTime(prev => (prev + 5) % 60 || 5)}
              >
                <span className="text-sm">{preparationTime}s</span>
              </div>
              <div 
                className="w-12 h-12 rounded-full border-2 border-teal-400 flex items-center justify-center cursor-pointer hover:bg-teal-400/20 transition-colors"
                onClick={() => !isRunning && setIntervalTime(prev => (prev + 5) % 30 || 5)}
              >
                <span className="text-sm">{intervalTime}</span>
              </div>
              <div 
                className="w-12 h-12 rounded-full border-2 border-red-400 flex items-center justify-center cursor-pointer hover:bg-red-400/20 transition-colors"
                onClick={() => !isRunning && setTotalTime(prev => (prev + 5) % 60 || 5)}
              >
                <span className="text-sm">{totalTime}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timer info */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-red-400">Meditation Time</span>
            <span>{totalTime}m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-teal-400">Interval</span>
            <span>{intervalTime}m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">Preparation Time</span>
            <span>{preparationTime}s</span>
          </div>
        </div>
        
        {/* Current phase display */}
        {isRunning && (
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">
              {currentPhase === "preparation" ? "Preparing..." : 
               currentPhase === "meditation" ? `Meditating - ${formatTime(timeElapsed)}` :
               "Complete!"}
            </p>
            {currentPhase === "meditation" && (
              <p className="text-sm text-gray-400">Interval {intervalsCompleted + 1} of {Math.floor(totalTime / intervalTime)}</p>
            )}
          </div>
        )}
        
        {/* Control button */}
        <Button
          onClick={isRunning ? handleStop : handleBegin}
          className={`w-full ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isRunning ? "Stop" : "Begin"}
        </Button>
      </Card>

      {/* Progress graphs placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Meditation Progress
        </h3>
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Progress visualization coming soon</p>
        </div>
      </Card>

      {/* Milestones */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Milestones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allMilestones.map((milestone) => {
            const Icon = milestone.icon;
            return (
              <Card 
                key={milestone.id} 
                className={`p-4 transition-all ${
                  milestone.earned 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className={`w-8 h-8 mb-2 ${milestone.earned ? 'text-white' : 'text-gray-300'}`} />
                <h4 className="font-semibold text-sm">{milestone.title}</h4>
                <p className="text-xs opacity-80">{milestone.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}