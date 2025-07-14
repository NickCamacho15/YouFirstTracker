import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Trophy, Target, CheckCircle2, Plus, Calendar, Award, Sparkles } from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  category: 'personal' | 'professional' | 'health' | 'relationships' | 'education' | 'financial';
  impact?: string;
}

export function AchievementHistory() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "Completed Marathon",
      description: "Finished my first marathon in under 4 hours after 6 months of training",
      date: "2023-10-15",
      category: "health",
      impact: "Proved I can accomplish anything with dedication and consistency"
    },
    {
      id: 2,
      title: "Promoted to Senior Developer",
      description: "Earned promotion after leading successful product launch",
      date: "2023-06-01",
      category: "professional",
      impact: "Validated my technical skills and leadership abilities"
    }
  ]);

  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'personal' as const,
    impact: ''
  });

  const categoryColors = {
    personal: 'bg-purple-100 text-purple-800',
    professional: 'bg-blue-100 text-blue-800',
    health: 'bg-green-100 text-green-800',
    relationships: 'bg-pink-100 text-pink-800',
    education: 'bg-yellow-100 text-yellow-800',
    financial: 'bg-orange-100 text-orange-800'
  };

  const categoryIcons = {
    personal: <Star className="w-4 h-4" />,
    professional: <Trophy className="w-4 h-4" />,
    health: <Target className="w-4 h-4" />,
    relationships: <Sparkles className="w-4 h-4" />,
    education: <Award className="w-4 h-4" />,
    financial: <CheckCircle2 className="w-4 h-4" />
  };

  const handleAddAchievement = () => {
    if (newAchievement.title && newAchievement.description) {
      setAchievements(prev => [
        {
          ...newAchievement,
          id: Date.now()
        },
        ...prev
      ]);
      setNewAchievement({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'personal',
        impact: ''
      });
      setIsAddingAchievement(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Achievement History</CardTitle>
              <p className="text-sm text-gray-600">Your track record of success</p>
            </div>
          </div>
          <Dialog open={isAddingAchievement} onOpenChange={setIsAddingAchievement}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Past Achievement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">What did you achieve?</label>
                  <Input
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Launched my first product"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Describe your achievement</label>
                  <Textarea
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What did you do? How did you do it? What challenges did you overcome?"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date achieved</label>
                    <Input
                      type="date"
                      value={newAchievement.date}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={newAchievement.category}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="personal">Personal</option>
                      <option value="professional">Professional</option>
                      <option value="health">Health & Fitness</option>
                      <option value="relationships">Relationships</option>
                      <option value="education">Education</option>
                      <option value="financial">Financial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">What impact did this have? (Optional)</label>
                  <Textarea
                    value={newAchievement.impact}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, impact: e.target.value }))}
                    placeholder="How did this achievement change you or your life?"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingAchievement(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAchievement} disabled={!newAchievement.title || !newAchievement.description}>
                    Add Achievement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-800 italic">
            "Your past achievements are proof of your capability. You've overcome challenges before, 
            and you can do it again. Every success builds the foundation for the next."
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{achievements.length}</div>
            <p className="text-sm text-gray-600">Total Achievements</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {achievements.filter(a => new Date(a.date).getFullYear() === new Date().getFullYear()).length}
            </div>
            <p className="text-sm text-gray-600">This Year</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {[...new Set(achievements.map(a => a.category))].length}
            </div>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Start documenting your achievements to build confidence and track your growth journey.
              </p>
            </div>
          ) : (
            achievements.map((achievement) => (
              <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[achievement.category].split(' ')[0]}`}>
                      {categoryIcons[achievement.category]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      {achievement.impact && (
                        <p className="text-sm text-gray-500 mt-2 italic">"{achievement.impact}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={categoryColors[achievement.category]}>
                      {achievement.category}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}