import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, Target, Shield } from "lucide-react";
import { useState } from "react";

interface DisciplineStatsProps {
  rules: any[];
  challenges: any[];
}

export function DisciplineStats({ rules = [], challenges = [] }: DisciplineStatsProps) {
  const [showStats, setShowStats] = useState(true);

  if (!showStats) return null;

  const activeRules = rules.length;
  const keptToday = rules.filter(rule => rule.completedToday).length;
  const currentStreak = Math.min(...rules.map(rule => rule.streak || 0));
  
  const activeChallenges = challenges.length;
  const challengeProgress = challenges.reduce((acc, challenge) => {
    const completedDays = challenge.completedDays?.length || 0;
    return acc + Math.round((completedDays / challenge.duration) * 100);
  }, 0);
  const avgChallengeProgress = activeChallenges > 0 ? Math.round(challengeProgress / activeChallenges) : 0;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Personal Rules Adherence</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(false)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs text-slate-600 mb-4">
          Your discipline heat map
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 mb-1">{activeRules}</div>
            <div className="text-sm text-slate-600">Active Rules</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{keptToday}</div>
            <div className="text-sm text-slate-600">Kept Today</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{avgChallengeProgress}%</div>
            <div className="text-sm text-slate-600">Challenge Progress</div>
          </div>
        </div>

        {activeChallenges > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{activeChallenges} active challenge{activeChallenges !== 1 ? 's' : ''}</span>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {currentStreak > 0 ? `${currentStreak} day streak` : 'Build streak'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}