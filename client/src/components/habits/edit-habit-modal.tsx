import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const editHabitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.string().default("daily"),
  category: z.enum(["mind", "body", "soul"]).default("mind"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]).default("anytime"),
});

type EditHabitFormData = z.infer<typeof editHabitSchema>;

interface Habit {
  id: number;
  title: string;
  description?: string;
  frequency: string;
  category?: string;
  timeOfDay?: string;
  streak: number;
  completedToday: boolean;
}

interface EditHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  habit: Habit | null;
}

export function EditHabitModal({ open, onOpenChange, onSuccess, habit }: EditHabitModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditHabitFormData>({
    resolver: zodResolver(editHabitSchema),
    defaultValues: {
      title: habit?.title || "",
      description: habit?.description || "",
      frequency: habit?.frequency || "daily",
      category: (habit?.category as "mind" | "body" | "soul") || "mind",
      timeOfDay: (habit?.timeOfDay as "morning" | "afternoon" | "evening" | "anytime") || "anytime",
    },
  });

  // Reset form when habit changes
  useState(() => {
    if (habit) {
      form.reset({
        title: habit.title,
        description: habit.description || "",
        frequency: habit.frequency,
        category: (habit.category as "mind" | "body" | "soul") || "mind",
        timeOfDay: (habit.timeOfDay as "morning" | "afternoon" | "evening" | "anytime") || "anytime",
      });
    }
  });

  const updateHabitMutation = useMutation({
    mutationFn: async (data: EditHabitFormData) => {
      if (!habit) throw new Error("No habit selected");
      const response = await apiRequest(`/api/habits/${habit.id}`, "PATCH", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      onSuccess();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Habit updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update habit",
        variant: "destructive",
      });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async () => {
      if (!habit) throw new Error("No habit selected");
      await apiRequest(`/api/habits/${habit.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      onSuccess();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Habit deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete habit",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditHabitFormData) => {
    updateHabitMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      deleteHabitMutation.mutate();
    }
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
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
                    <Input placeholder="e.g., Morning meditation" {...field} />
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

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteHabitMutation.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Habit
              </Button>

              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateHabitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateHabitMutation.isPending}
                >
                  {updateHabitMutation.isPending ? "Updating..." : "Update Habit"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}