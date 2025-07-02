import { useState } from "react";
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
import { Plus, X, Heart, DollarSign, Briefcase, User, Shield, AlertTriangle } from "lucide-react";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["physical", "financial", "career", "personal", "health"]),
  benefits: z.array(z.string().min(1)).min(3, "At least 3 benefits are required"),
  consequences: z.array(z.string().min(1)).min(1, "At least 1 consequence is required"),
  dueDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

const goalTypes = [
  { value: "physical", label: "Physical", icon: Heart, color: "bg-red-500", lightColor: "bg-red-50 text-red-700 border-red-200" },
  { value: "financial", label: "Financial", icon: DollarSign, color: "bg-green-500", lightColor: "bg-green-50 text-green-700 border-green-200" },
  { value: "career", label: "Career", icon: Briefcase, color: "bg-blue-500", lightColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "personal", label: "Personal", icon: User, color: "bg-purple-500", lightColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "health", label: "Health", icon: Shield, color: "bg-emerald-500", lightColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

interface NewGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewGoalModal({ open, onOpenChange, onSuccess }: NewGoalModalProps) {
  const [microGoals, setMicroGoals] = useState<string[]>([""]);
  const { toast } = useToast();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData & { microGoals: string[] }) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      form.reset();
      setMicroGoals([""]);
      toast({ title: "Goal created!", description: "Your new goal has been added to your dashboard." });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    const filteredMicroGoals = microGoals.filter(mg => mg.trim() !== "");
    createGoalMutation.mutate({
      ...data,
      microGoals: filteredMicroGoals,
    });
  };

  const addMicroGoal = () => {
    setMicroGoals([...microGoals, ""]);
  };

  const removeMicroGoal = (index: number) => {
    if (microGoals.length > 1) {
      setMicroGoals(microGoals.filter((_, i) => i !== index));
    }
  };

  const updateMicroGoal = (index: number, value: string) => {
    const updated = [...microGoals];
    updated[index] = value;
    setMicroGoals(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-4 animate-slide-up">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your main goal" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your goal in detail"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Micro-Goals</FormLabel>
              <div className="space-y-2 mt-2">
                {microGoals.map((microGoal, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Break down into smaller steps"
                      value={microGoal}
                      onChange={(e) => updateMicroGoal(index, e.target.value)}
                    />
                    {microGoals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMicroGoal(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMicroGoal}
                  className="text-accent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add another step
                </Button>
              </div>
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
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
