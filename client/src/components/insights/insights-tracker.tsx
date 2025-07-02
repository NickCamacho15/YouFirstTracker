import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertInsightSchema, type Insight } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Lightbulb, Eye, EyeOff, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

export function InsightsTracker() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['/api/insights'],
  });

  const createInsightMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/insights', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      setIsAddModalOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertInsightSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'reflection',
      tags: [],
      isPrivate: false,
    },
  });

  const onSubmit = (data: any) => {
    createInsightMutation.mutate(data);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      reflection: 'bg-blue-100 text-blue-800',
      breakthrough: 'bg-green-100 text-green-800',
      lesson: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      challenge: 'bg-red-100 text-red-800',
      growth: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Insights Tracker</h2>
            <p className="text-gray-600">Capture your reflections, breakthroughs, and learnings</p>
          </div>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Insight
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Capture New Insight</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="What's your key insight?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reflection">Reflection</SelectItem>
                          <SelectItem value="breakthrough">Breakthrough</SelectItem>
                          <SelectItem value="lesson">Lesson Learned</SelectItem>
                          <SelectItem value="idea">New Idea</SelectItem>
                          <SelectItem value="challenge">Challenge</SelectItem>
                          <SelectItem value="growth">Personal Growth</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your insight in detail..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4">
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(!field.value)}
                            className="flex items-center gap-2"
                          >
                            {field.value ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {field.value ? 'Private' : 'Public'}
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createInsightMutation.isPending}>
                      {createInsightMutation.isPending ? 'Saving...' : 'Save Insight'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Insights Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-600 mb-4">Start capturing your reflections and breakthroughs</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Insight
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(insights as Insight[]).map((insight) => (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {insight.title}
                  </CardTitle>
                  {insight.isPrivate && (
                    <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getCategoryColor(insight.category || 'reflection')}>
                    {insight.category}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(insight.createdAt!), 'MMM d')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm line-clamp-4 leading-relaxed">
                  {insight.content}
                </p>
                {insight.tags && insight.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    <Tag className="w-3 h-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {insight.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{insight.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}