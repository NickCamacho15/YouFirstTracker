import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Home, Target, Repeat, Brain, ImageIcon, User, Sparkles, Dumbbell } from "lucide-react";
import uoyLogo from "@assets/You. Logo-6_1752099024177.png";

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
                    .uoY
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 items-center h-20 px-4 relative">
          {/* Disciplines */}
          <Link href="/habits">
            <div className={`flex flex-col items-center justify-center py-2 transition-colors cursor-pointer ${
              isActive("/habits")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
              <Repeat className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Disciplines</span>
            </div>
          </Link>

          {/* Goals */}
          <Link href="/goals">
            <div className={`flex flex-col items-center justify-center py-2 transition-colors cursor-pointer ${
              isActive("/goals")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
              <Target className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Goals</span>
            </div>
          </Link>

          {/* Center - You. Button with Black Circle */}
          <div className="flex justify-center">
            <Link href="/">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer relative -top-2 ${
                location === "/"
                  ? "bg-gradient-to-br from-gray-900 to-black scale-110 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  : "bg-gradient-to-br from-gray-800 to-black hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              }`}>
                <img 
                  src={uoyLogo} 
                  alt=".uoY" 
                  className="w-12 h-12"
                />
              </div>
            </Link>
          </div>

          {/* Mind */}
          <Link href="/read">
            <div className={`flex flex-col items-center justify-center py-2 transition-colors cursor-pointer ${
              isActive("/read")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
              <Brain className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Mind</span>
            </div>
          </Link>

          {/* Body */}
          <Link href="/health">
            <div className={`flex flex-col items-center justify-center py-2 transition-colors cursor-pointer ${
              isActive("/health")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
              <Dumbbell className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Body</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}