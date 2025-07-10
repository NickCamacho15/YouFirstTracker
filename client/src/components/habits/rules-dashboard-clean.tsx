import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Settings, Flame, TrendingUp, X, Plus, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Rule {
  id: number;
  text: string;
  violated: boolean;
  streak: number;
  category: string;
  completedToday: boolean;
  failures: number;
}

interface RulesDashboardProps {
  rules: Rule[];
  onToggleRuleCompletion: (ruleId: number) => void;
  onMarkRuleFailure: (ruleId: number) => void;
  onAddRule: (text: string, category: string) => void;
  isLoading: boolean;
}

export function RulesDashboard({ rules, onToggleRuleCompletion, onMarkRuleFailure, onAddRule, isLoading }: RulesDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [newRuleText, setNewRuleText] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Personal');
  
  const completedToday = rules.filter(r => r.completedToday).length;
  const avgConsistency = rules.length > 0 ? Math.round(rules.reduce((sum, r) => sum + Math.min(r.streak / 365, 1), 0) / rules.length * 100) : 0;
  const longestStreak = rules.length > 0 ? Math.max(...rules.map(r => r.streak)) : 0;
  const totalFailures = rules.reduce((sum, r) => sum + r.failures, 0);

  // Generate rule completion data for calendar
  const generateRuleCalendarData = (rule: Rule) => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate completion based on streak (higher streak = higher completion rate)
      const completionRate = Math.min(rule.streak / 30, 0.85) + 0.1;
      const isCompleted = Math.random() < completionRate;
      
      days.push({
        date,
        completed: isCompleted,
        dayOfMonth: date.getDate()
      });
    }
    return days;
  };

  // Generate aggregated calendar data for all rules
  const generateAggregatedCalendarData = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Count how many rules were completed on this day (simulated)
      const completedRulesCount = rules.reduce((count, rule) => {
        const completionRate = Math.min(rule.streak / 30, 0.85) + 0.1;
        return count + (Math.random() < completionRate ? 1 : 0);
      }, 0);
      
      const completionPercentage = rules.length > 0 ? completedRulesCount / rules.length : 0;
      
      days.push({
        date,
        completedCount: completedRulesCount,
        totalRules: rules.length,
        completionPercentage,
        dayOfMonth: date.getDate()
      });
    }
    return days;
  };

  // Month navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get calendar color based on completion percentage
  const getCalendarDayColor = (completionPercentage: number) => {
    if (completionPercentage === 1) return 'bg-green-500';
    if (completionPercentage >= 0.75) return 'bg-green-400';
    if (completionPercentage >= 0.5) return 'bg-yellow-400';
    if (completionPercentage >= 0.25) return 'bg-orange-400';
    if (completionPercentage > 0) return 'bg-red-300';
    return 'bg-gray-200';
  };

  const handleAddRule = () => {
    if (newRuleText.trim()) {
      onAddRule(newRuleText.trim(), newRuleCategory);
      setNewRuleText('');
    }
  };

  const aggregatedCalendarData = generateAggregatedCalendarData();

  const categories = [
    { name: 'Digital Wellness', emoji: '📱', color: 'blue' },
    { name: 'Nutrition', emoji: '🥗', color: 'green' },
    { name: 'Sleep Hygiene', emoji: '😴', color: 'purple' },
    { name: 'Mental Health', emoji: '🧠', color: 'indigo' },
    { name: 'Fitness', emoji: '💪', color: 'orange' },
    { name: 'Personal', emoji: '⭐', color: 'yellow' }
  ];

  return (
    <div className="space-y-4">

      {/* Add New Rule */}
      <div id="add-rule-section" style={{ display: 'none' }}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add New Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="What rule will you commit to?"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
              />
              <select
                value={newRuleCategory}
                onChange={(e) => setNewRuleCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
              <Button onClick={handleAddRule} size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Rules in Single Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                <span className="text-white text-sm">🛡️</span>
              </div>
              <div>
                <CardTitle className="text-lg">Rules of Negation</CardTitle>
                <p className="text-sm text-gray-500">Personal discipline standards</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => {
                // Toggle add rule section visibility
                const addSection = document.getElementById('add-rule-section');
                if (addSection) {
                  addSection.style.display = addSection.style.display === 'none' ? 'block' : 'none';
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id}>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Completion Checkbox */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleRuleCompletion(rule.id)}
                    className={`h-6 w-6 p-0 rounded border-2 ${
                      rule.completedToday 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {rule.completedToday && <CheckCircle2 className="w-4 h-4" />}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{rule.text}</div>
                    <div className="text-sm text-blue-600 font-medium">{rule.streak} day streak</div>
                  </div>

                  {/* Expand Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedRule === rule.id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                {/* Individual Rule Calendar (Expanded) */}
                {expandedRule === rule.id && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">{rule.text} - Last 30 Days</h4>
                    <div className="grid grid-cols-10 gap-1">
                      {generateRuleCalendarData(rule).map((day, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded text-xs flex items-center justify-center text-white font-medium ${
                            day.completed ? 'bg-green-500' : 'bg-red-400'
                          }`}
                        >
                          {day.dayOfMonth}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleRuleCompletion(rule.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Mark Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkRuleFailure(rule.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Mark Failed
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {rules.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No rules yet. Add your first rule to start building discipline!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}