import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Eye, Target, Calendar, BarChart3, Book, Flame, CheckSquare, Zap } from "lucide-react";

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  category: 'core' | 'habits' | 'goals' | 'wellness' | 'social';
  isPremium?: boolean;
}

interface ModuleSelectorProps {
  modules: ModuleConfig[];
  onModuleToggle: (moduleId: string, enabled: boolean) => void;
  onClose: () => void;
}

export function ModuleSelector({ modules, onModuleToggle, onClose }: ModuleSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Modules', count: modules.length },
    { id: 'core', name: 'Core', count: modules.filter(m => m.category === 'core').length },
    { id: 'habits', name: 'Habits', count: modules.filter(m => m.category === 'habits').length },
    { id: 'goals', name: 'Goals', count: modules.filter(m => m.category === 'goals').length },
    { id: 'wellness', name: 'Wellness', count: modules.filter(m => m.category === 'wellness').length },
    { id: 'social', name: 'Social', count: modules.filter(m => m.category === 'social').length },
  ];

  const filteredModules = activeCategory === 'all' 
    ? modules 
    : modules.filter(m => m.category === activeCategory);

  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Customize Your Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose the modules that serve your personal excellence journey
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {enabledCount} Active
            </Badge>
            <Button onClick={onClose} variant="outline" size="sm">
              Done
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map((module) => {
            const IconComponent = module.icon;
            
            return (
              <div
                key={module.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  module.enabled
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                    : 'border-gray-200 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      module.enabled 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        module.enabled 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        {module.name}
                        {module.isPremium && (
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200">
                            Premium
                          </Badge>
                        )}
                      </h3>
                      <Badge variant="outline" className="text-xs mt-1 capitalize">
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={(checked) => onModuleToggle(module.id, checked)}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Philosophy Note */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg">
          <p className="text-sm text-center text-gray-700 dark:text-gray-300">
            <strong>.uoY Philosophy:</strong> Your dashboard should reflect your unique path to excellence. 
            Enable only the modules that serve your current growth phase and goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}