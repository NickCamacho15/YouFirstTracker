import { Navigation } from "@/components/layout/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Logged out successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-2">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4 bg-accent">
                  <AvatarFallback className="text-white text-lg font-semibold">
                    {user?.displayName ? getInitials(user.displayName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user?.displayName}</CardTitle>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile (Coming Soon)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings & Features */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates about your goals and habits</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-medium">Data Export</h4>
                      <p className="text-sm text-muted-foreground">Download your goals, habits, and progress data</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <h4 className="font-medium">Vision Board</h4>
                      <p className="text-sm text-muted-foreground">Create visual representations of your goals</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About You. First.</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You. First. is a premium self-leadership platform designed to help you set goals, 
                  track habits, reflect on learning, and stay accountable through a minimal social feed — 
                  all rooted in the belief: "Who you see is what matters."
                </p>
                <p className="text-sm text-muted-foreground">
                  This platform comes free with any You.™ apparel purchase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
