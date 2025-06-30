import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <div className="hidden sm:block">
              <div className="flex items-baseline space-x-6">
                <Link href="/">
                  <span
                    className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      location === "/"
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Dashboard
                  </span>
                </Link>
                <Link href="/you">
                  <span
                    className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      isActive("/you")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    You
                  </span>
                </Link>
                <Link href="/goals">
                  <span
                    className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      isActive("/goals")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Goals
                  </span>
                </Link>
                <Link href="/habits">
                  <span
                    className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      isActive("/habits")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Habits
                  </span>
                </Link>
                <Link href="/read">
                  <span
                    className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      isActive("/read")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Read
                  </span>
                </Link>
                <Link href="/vision">
                  <span
                    className={`px-2 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      isActive("/vision")
                        ? "text-accent border-accent"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    Vision
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            {/* Desktop notifications and profile */}
            <div className="hidden sm:flex items-center space-x-4">
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
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              <Link href="/">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    location === "/"
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  Dashboard
                </span>
              </Link>
              <Link href="/you">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive("/you")
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  You
                </span>
              </Link>
              <Link href="/goals">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive("/goals")
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  Goals
                </span>
              </Link>
              <Link href="/habits">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive("/habits")
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  Habits
                </span>
              </Link>
              <Link href="/read">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive("/read")
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  Read
                </span>
              </Link>
              <Link href="/vision">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive("/vision")
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  Vision
                </span>
              </Link>
              <Link href="/profile">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer ${
                    isActive("/profile")
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                  }`}
                >
                  Profile
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
