import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Home, Target, Repeat, BookOpen, ImageIcon } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Header */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <h1 className="text-xl font-bold text-foreground cursor-pointer">
                    You. <span className="text-accent">First.</span>
                  </h1>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Link href="/profile">
                <Avatar className="w-8 h-8 bg-accent cursor-pointer">
                  <AvatarFallback className="text-white text-sm font-medium">
                    {user?.displayName ? getInitials(user.displayName) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16 px-4">
          <Link href="/">
            <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors cursor-pointer ${
              location === "/"
                ? "text-accent bg-accent/10"
                : "text-muted-foreground hover:text-foreground"
            }`}>
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Dashboard</span>
            </div>
          </Link>
          

          <Link href="/goals">
            <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/goals")
                ? "text-accent bg-accent/10"
                : "text-muted-foreground hover:text-foreground"
            }`}>
              <Target className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Goals</span>
            </div>
          </Link>
          
          <Link href="/habits">
            <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/habits")
                ? "text-accent bg-accent/10"
                : "text-muted-foreground hover:text-foreground"
            }`}>
              <Repeat className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Habits</span>
            </div>
          </Link>
          
          <Link href="/read">
            <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/read")
                ? "text-accent bg-accent/10"
                : "text-muted-foreground hover:text-foreground"
            }`}>
              <BookOpen className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Read</span>
            </div>
          </Link>
          
          <Link href="/vision">
            <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors cursor-pointer ${
              isActive("/vision")
                ? "text-accent bg-accent/10"
                : "text-muted-foreground hover:text-foreground"
            }`}>
              <ImageIcon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Vision</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}