import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Smartphone, TrendingUp, Upload, Instagram, Twitter } from "lucide-react";
import { SiTiktok, SiSnapchat } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScreenTimeEntry {
  id: number;
  userId: number;
  platform: string;
  timeMinutes: number;
  date: string;
  createdAt: string;
}

interface ScreenTimeStats {
  totalTime: number;
  avgDaily: number;
  platforms: {
    platform: string;
    totalTime: number;
    percentage: number;
  }[];
}

export default function DistractionSection() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load screen time stats
  const { data: stats = { totalTime: 0, avgDaily: 0, platforms: [] } } = useQuery({
    queryKey: ["/api/screen-time/stats"],
  });

  // Create screen time entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: { platform: string; timeMinutes: number; date: string }) => {
      const response = await apiRequest("POST", "/api/screen-time/entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screen-time/stats"] });
      toast({ 
        title: "Screen time logged!", 
        description: "Your social media usage has been recorded." 
      });
      setShowUploadDialog(false);
      setHours("");
      setMinutes("");
      setSelectedPlatform("");
    },
  });

  const platforms = [
    { 
      name: "Instagram", 
      icon: Instagram, 
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
    },
    { 
      name: "TikTok", 
      icon: SiTiktok, 
      color: "from-black to-red-500",
      bgColor: "bg-gradient-to-br from-gray-50 to-red-50 border-gray-200"
    },
    { 
      name: "Snapchat", 
      icon: SiSnapchat, 
      color: "from-yellow-400 to-yellow-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
    },
    { 
      name: "X", 
      icon: Twitter, 
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
    }
  ];

  const handleUpload = (platformName: string) => {
    setSelectedPlatform(platformName);
    setShowUploadDialog(true);
  };

  const handleSubmit = () => {
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (selectedPlatform && totalMinutes > 0 && entryDate) {
      createEntryMutation.mutate({
        platform: selectedPlatform,
        timeMinutes: totalMinutes,
        date: entryDate
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-background border shadow-md shadow-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
            <Clock className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-4xl font-bold text-foreground">{formatTime(stats.totalTime)}</div>
            <p className="text-sm text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border shadow-md shadow-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-4xl font-bold text-foreground">{formatTime(stats.avgDaily)}</div>
            <p className="text-sm text-muted-foreground">
              Per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Tiles */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Social Media Platforms
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const platformStats = stats.platforms.find(p => p.platform === platform.name);
            const Icon = platform.icon;
            
            return (
              <Card key={platform.name} className={`${platform.bgColor} shadow-lg hover:shadow-xl transition-all cursor-pointer`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-900">{platform.name}</h4>
                        <p className="text-base text-gray-600 mt-1">
                          {platformStats ? formatTime(platformStats.totalTime) : "No data"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="default"
                      variant="outline"
                      onClick={() => handleUpload(platform.name)}
                      className="flex items-center gap-2 bg-white/90 hover:bg-white border-gray-300"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                </CardHeader>
                
                {platformStats && (
                  <CardContent className="pt-0 pb-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-gray-700 font-medium">Weekly total</span>
                        <span className="font-bold text-lg text-gray-900">
                          {formatTime(platformStats.totalTime)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Usage share</span>
                          <span className="font-medium text-gray-800">
                            {platformStats.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/60 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full bg-gradient-to-r ${platform.color} shadow-sm`}
                            style={{ width: `${Math.min(platformStats.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Screen Time - {selectedPlatform}</DialogTitle>
            <DialogDescription>
              Enter your screen time data for {selectedPlatform}. You can find this in your phone's Screen Time or Digital Wellbeing settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Time Spent</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hours" className="text-sm text-gray-600">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    min="0"
                    max="24"
                  />
                </div>
                <div>
                  <Label htmlFor="minutes" className="text-sm text-gray-600">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    min="0"
                    max="59"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Enter the time spent on {selectedPlatform} for this day
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  setHours("");
                  setMinutes("");
                  setSelectedPlatform("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={(!hours && !minutes) || !selectedPlatform || createEntryMutation.isPending}
              >
                {createEntryMutation.isPending ? "Uploading..." : "Upload Time"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}