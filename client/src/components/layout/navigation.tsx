import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
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
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary cursor-pointer">
                  You. <span className="text-accent">First.</span>
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                <Link href="/you">
                  <a
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      isActive("/you")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-primary border-transparent"
                    }`}
                  >
                    You
                  </a>
                </Link>
                <Link href="/goals">
                  <a
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      isActive("/goals")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-primary border-transparent"
                    }`}
                  >
                    Goals
                  </a>
                </Link>
                <Link href="/habits">
                  <a
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      isActive("/habits")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-primary border-transparent"
                    }`}
                  >
                    Habits
                  </a>
                </Link>
                <Link href="/read">
                  <a
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      isActive("/read")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-primary border-transparent"
                    }`}
                  >
                    Read
                  </a>
                </Link>
                <Link href="/vision">
                  <a
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      isActive("/vision")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-primary border-transparent"
                    }`}
                  >
                    Vision
                  </a>
                </Link>
              </div>
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
  );
}
