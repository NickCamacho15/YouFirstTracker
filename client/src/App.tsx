import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import DashboardPage from "@/pages/dashboard";
import GoalsPage from "@/pages/goals";
import HabitsPage from "@/pages/habits";
import ReadPage from "@/pages/read";
import VisionPage from "@/pages/vision";
import ProfilePage from "@/pages/profile";
import HealthPage from "@/pages/health";
import NotFound from "@/pages/not-found";
import { Navigation } from "@/components/layout/navigation";

function AuthenticatedApp() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/you" component={DashboardPage} />
        <Route path="/goals" component={GoalsPage} />
        <Route path="/habits" component={HabitsPage} />
        <Route path="/read" component={ReadPage} />
        <Route path="/health" component={HealthPage} />
        <Route path="/vision" component={VisionPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <LoginPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
