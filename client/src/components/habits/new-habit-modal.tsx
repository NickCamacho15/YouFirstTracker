import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const habitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.string().default("daily"),
  category: z.enum(["mind", "body", "soul"]).default("mind"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime"),
  reasons: z.array(z.string().min(1, "Reason cannot be empty")).min(3, "Please provide exactly 3 reasons").max(3, "Please provide exactly 3 reasons"),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface NewHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewHabitModal({ open, onOpenChange, onSuccess }: NewHabitModalProps) {
  const { toast } = useToast();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: "",
      description: "",
      frequency: "daily",
      category: "mind" as const,
      timeOfDay: "anytime" as const,
      reasons: ["", "", ""],
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data: HabitFormData) => {
      const response = await apiRequest("POST", "/api/habits", data);
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      form.reset({
        title: "",
        description: "",
        frequency: "daily",
        category: "mind" as const,
        reasons: ["", "", ""],
      });
      toast({ title: "Habit created!", description: "Your new habit has been added to your dashboard." });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HabitFormData) => {
    createHabitMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Meditation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 10 minutes of mindfulness meditation"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="mind">🧠 Mind</SelectItem>
                        <SelectItem value="body">💪 Body</SelectItem>
                        <SelectItem value="soul">✨ Soul</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">🌅 Morning</SelectItem>
                        <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                        <SelectItem value="evening">🌙 Evening</SelectItem>
                        <SelectItem value="anytime">⏰ Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Three Reasons Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground">
                Why is this habit important to you? <span className="text-destructive">*</span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Research shows that having clear reasons increases habit success by 60%. 
                Please provide exactly 3 specific reasons.
              </div>
              
              {[0, 1, 2].map((index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`reasons.${index}` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Reason {index + 1}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            index === 0 
                              ? "e.g., It improves my mental health and reduces stress"
                              : index === 1
                              ? "e.g., It helps me be more productive throughout the day"
                              : "e.g., It builds discipline that transfers to other areas of life"
                          }
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex space-x-3 mt-8">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createHabitMutation.isPending}
              >
                {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
