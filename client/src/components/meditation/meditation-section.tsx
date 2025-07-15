import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Timer, BarChart3, Trophy, Flame, Target, Award, Star, Crown, Gem, Medal, Zap, Activity, Calendar } from "lucide-react";

export function MeditationSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gongIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer states
  const [preparationTime, setPreparationTime] = useState(30); // in seconds
  const [intervalTime, setIntervalTime] = useState(5); // in minutes
  const [totalTime, setTotalTime] = useState(15); // in minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<"preparation" | "meditation" | "complete">("preparation");
  const [intervalsCompleted, setIntervalsCompleted] = useState(0);
  const [isDragging, setIsDragging] = useState<string | null>(null);

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

  // Play peaceful meditation chime sound
  const playGong = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillators for gentle chime
    const fundamental = audioContext.createOscillator();
    const harmonic1 = audioContext.createOscillator();
    const harmonic2 = audioContext.createOscillator();
    
    const gainNode = audioContext.createGain();
    const harmonic1Gain = audioContext.createGain();
    const harmonic2Gain = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    
    // Connect nodes
    fundamental.connect(gainNode);
    harmonic1.connect(harmonic1Gain);
    harmonic2.connect(harmonic2Gain);
    
    harmonic1Gain.connect(gainNode);
    harmonic2Gain.connect(gainNode);
    gainNode.connect(filterNode);
    filterNode.connect(audioContext.destination);
    
    // Gentle chime - higher frequency for peaceful sound (A4 = 440Hz)
    fundamental.frequency.setValueAtTime(440, audioContext.currentTime);
    fundamental.frequency.exponentialRampToValueAtTime(420, audioContext.currentTime + 2);
    fundamental.type = "sine";
    
    // Sweet harmonics for bell-like quality
    harmonic1.frequency.setValueAtTime(880, audioContext.currentTime); // Octave
    harmonic1.frequency.exponentialRampToValueAtTime(840, audioContext.currentTime + 1.8);
    harmonic1.type = "sine";
    
    harmonic2.frequency.setValueAtTime(1320, audioContext.currentTime); // Perfect fifth
    harmonic2.frequency.exponentialRampToValueAtTime(1260, audioContext.currentTime + 1.5);
    harmonic2.type = "sine";
    
    // High-pass filter for bright, clean sound
    filterNode.type = "highpass";
    filterNode.frequency.setValueAtTime(200, audioContext.currentTime);
    filterNode.Q.setValueAtTime(0.5, audioContext.currentTime);
    
    // Very gentle envelope for softer, shorter decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    harmonic1Gain.gain.setValueAtTime(0, audioContext.currentTime);
    harmonic1Gain.gain.linearRampToValueAtTime(0.18, audioContext.currentTime + 0.03);
    harmonic1Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.8);
    
    harmonic2Gain.gain.setValueAtTime(0, audioContext.currentTime);
    harmonic2Gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.05);
    harmonic2Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
    
    // Start oscillators
    fundamental.start(audioContext.currentTime);
    harmonic1.start(audioContext.currentTime);
    harmonic2.start(audioContext.currentTime);
    
    // Stop oscillators after gentle 2-second decay
    fundamental.stop(audioContext.currentTime + 2);
    harmonic1.stop(audioContext.currentTime + 1.8);
    harmonic2.stop(audioContext.currentTime + 1.5);
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
    playGong(); // Play gong at start
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

  // Handle slider drag
  const handleMouseDown = (slider: string) => {
    setIsDragging(slider);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const slider = document.getElementById(`${isDragging}-slider`);
    if (!slider) return;
    
    const rect = slider.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    if (isDragging === 'preparation') {
      setPreparationTime(Math.round(percentage * 60)); // 0-60 seconds
    } else if (isDragging === 'interval') {
      setIntervalTime(Math.round(percentage * 30) || 1); // 1-30 minutes
    } else if (isDragging === 'total') {
      setTotalTime(Math.round(percentage * 60) || 5); // 5-60 minutes
    }
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="space-y-4">
      {/* Total Time - Full Width */}
      <Card className="p-4 bg-white border shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-500" />
          <div>
            <p className="text-2xl font-bold">{Math.floor(stats.totalTime / 60)}h</p>
            <p className="text-sm text-muted-foreground">Total Time</p>
          </div>
        </div>
      </Card>

      {/* Sessions & Streak - Side by Side */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-white border shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.sessions}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border shadow-sm">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timer Controls */}
      <Card className="p-6 bg-white border shadow-md">
        <h3 className="text-lg font-semibold mb-6">Meditation Timer</h3>
        
        {/* Preparation Time Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Preparation</span>
            <span className="text-sm text-gray-600">{preparationTime}s</span>
          </div>
          <div id="preparation-slider" className="relative h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{ width: `${(preparationTime / 60) * 100}%` }}
            />
            <div 
              className="absolute w-5 h-5 bg-blue-600 rounded-full shadow-md cursor-pointer transform -translate-y-1.5"
              style={{ left: `${(preparationTime / 60) * 100}%`, marginLeft: '-10px' }}
              onMouseDown={() => handleMouseDown('preparation')}
              onTouchStart={() => handleMouseDown('preparation')}
            />
          </div>
        </div>

        {/* Interval Time Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-green-600">Interval</span>
            <span className="text-sm text-gray-600">{intervalTime}m</span>
          </div>
          <div id="interval-slider" className="relative h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute h-2 bg-green-500 rounded-full"
              style={{ width: `${(intervalTime / 30) * 100}%` }}
            />
            <div 
              className="absolute w-5 h-5 bg-green-600 rounded-full shadow-md cursor-pointer transform -translate-y-1.5"
              style={{ left: `${(intervalTime / 30) * 100}%`, marginLeft: '-10px' }}
              onMouseDown={() => handleMouseDown('interval')}
              onTouchStart={() => handleMouseDown('interval')}
            />
          </div>
        </div>

        {/* Total Time Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-orange-600">Meditation Time</span>
            <span className="text-sm text-gray-600">{totalTime}m</span>
          </div>
          <div id="total-slider" className="relative h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute h-2 bg-orange-500 rounded-full"
              style={{ width: `${(totalTime / 60) * 100}%` }}
            />
            <div 
              className="absolute w-5 h-5 bg-orange-600 rounded-full shadow-md cursor-pointer transform -translate-y-1.5"
              style={{ left: `${(totalTime / 60) * 100}%`, marginLeft: '-10px' }}
              onMouseDown={() => handleMouseDown('total')}
              onTouchStart={() => handleMouseDown('total')}
            />
          </div>
        </div>
        
        {/* Current phase display */}
        {isRunning && (
          <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-semibold">
              {currentPhase === "preparation" ? "Preparing..." : 
               currentPhase === "meditation" ? `Meditating - ${formatTime(timeElapsed)}` :
               "Complete!"}
            </p>
            {currentPhase === "meditation" && (
              <p className="text-sm text-gray-500">Interval {intervalsCompleted + 1} of {Math.floor(totalTime / intervalTime)}</p>
            )}
          </div>
        )}
        
        {/* Control button */}
        <Button
          onClick={isRunning ? handleStop : handleBegin}
          className={`w-full ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium`}
        >
          {isRunning ? "Stop Session" : "Start Session"}
        </Button>
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