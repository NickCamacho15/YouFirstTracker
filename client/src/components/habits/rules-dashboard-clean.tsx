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
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rules Adherence</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Top-level Aggregated Calendar */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Rules Combined</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{avgConsistency}%</div>
                <div className="text-xs text-gray-500">Avg</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{longestStreak}</div>
                <div className="text-xs text-gray-500">Peak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{completedToday}</div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{totalFailures}</div>
                <div className="text-xs text-gray-500">Failures</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Aggregated 30-day calendar grid */}
          <div className="grid grid-cols-10 gap-2">
            {aggregatedCalendarData.map((day, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded text-xs flex items-center justify-center text-white font-medium ${
                  getCalendarDayColor(day.completionPercentage)
                }`}
                title={`${day.completedCount}/${day.totalRules} rules followed`}
              >
                {day.dayOfMonth}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>50%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-300 rounded"></div>
              <span>&lt;50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>None</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Rule */}
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

      {/* Individual Rule Categories */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryRules = rules.filter(r => r.category === category.name);
          if (categoryRules.length === 0) return null;

          return (
            <Card key={category.name} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      category.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      category.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      category.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      category.color === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                      category.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    }`}>
                      <span className="text-white text-xs">{category.emoji}</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg">{category.name} Rules</CardTitle>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-600">
                      {categoryRules.filter(r => r.completedToday).length}/{categoryRules.length}
                    </div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {categoryRules.map((rule) => (
                    <div key={rule.id}>
                      <div 
                        className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 ${
                          rule.completedToday 
                            ? category.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                              category.color === 'green' ? 'bg-green-50 border-green-200' :
                              category.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                              category.color === 'indigo' ? 'bg-indigo-50 border-indigo-200' :
                              category.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                              'bg-yellow-50 border-yellow-200'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {/* Completion Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleRuleCompletion(rule.id)}
                          className={`h-8 w-8 p-0 rounded-md ${
                            rule.completedToday 
                              ? category.color === 'blue' ? 'text-blue-600 hover:bg-blue-100' :
                                category.color === 'green' ? 'text-green-600 hover:bg-green-100' :
                                category.color === 'purple' ? 'text-purple-600 hover:bg-purple-100' :
                                category.color === 'indigo' ? 'text-indigo-600 hover:bg-indigo-100' :
                                category.color === 'orange' ? 'text-orange-600 hover:bg-orange-100' :
                                'text-yellow-600 hover:bg-yellow-100'
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                        >
                          {rule.completedToday ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </Button>

                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${
                            rule.completedToday 
                              ? category.color === 'blue' ? 'text-blue-800 font-medium' :
                                category.color === 'green' ? 'text-green-800 font-medium' :
                                category.color === 'purple' ? 'text-purple-800 font-medium' :
                                category.color === 'indigo' ? 'text-indigo-800 font-medium' :
                                category.color === 'orange' ? 'text-orange-800 font-medium' :
                                'text-yellow-800 font-medium'
                              : 'text-gray-700'
                          }`}>
                            {rule.text}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                              category.color === 'blue' ? 'text-blue-600' :
                              category.color === 'green' ? 'text-green-600' :
                              category.color === 'purple' ? 'text-purple-600' :
                              category.color === 'indigo' ? 'text-indigo-600' :
                              category.color === 'orange' ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {rule.streak} day streak
                            </span>
                            {rule.failures > 0 && (
                              <span className="text-xs text-red-500 font-medium">
                                {rule.failures} fails
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Failure Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkRuleFailure(rule.id)}
                          className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-md"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Failed
                        </Button>

                        {/* Expand Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 rounded-md"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedRule === rule.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>

                      {/* Individual Rule Calendar (Expanded) */}
                      {expandedRule === rule.id && (
                        <div className={`mt-2 p-4 rounded-lg ${
                          category.color === 'blue' ? 'bg-blue-50' :
                          category.color === 'green' ? 'bg-green-50' :
                          category.color === 'purple' ? 'bg-purple-50' :
                          category.color === 'indigo' ? 'bg-indigo-50' :
                          category.color === 'orange' ? 'bg-orange-50' :
                          'bg-yellow-50'
                        }`}>
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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