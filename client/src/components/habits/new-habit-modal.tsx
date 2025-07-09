import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { insertHabitSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type NewHabitFormData = z.infer<typeof insertHabitSchema>;

interface NewHabitModalProps {
  category: "mind" | "body" | "soul";
  trigger: React.ReactNode;
}

const categoryInfo = {
  mind: {
    title: "Mind Habit",
    description: "Strengthen mental clarity and focus",
    color: "blue",
    icon: "🧠"
  },
  body: {
    title: "Body Habit", 
    description: "Build physical strength and vitality",
    color: "orange",
    icon: "💪"
  },
  soul: {
    title: "Soul Habit",
    description: "Nurture spiritual growth and purpose", 
    color: "emerald",
    icon: "✨"
  }
};

export function NewHabitModal({ category, trigger }: NewHabitModalProps) {
  const [open, setOpen] = useState(false);
  const [reasons, setReasons] = useState<string[]>(["", "", ""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const info = categoryInfo[category];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<NewHabitFormData>({
    resolver: zodResolver(insertHabitSchema),
    defaultValues: {
      category,
      frequency: "daily",
      timeOfDay: "anytime",
      reasons: ["", "", ""],
      reminder: "",
      routine: "",
      reward: ""
    }
  });

  const createHabit = useMutation({
    mutationFn: (data: NewHabitFormData) => apiRequest("/api/habits", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({
        title: "Success!",
        description: `New ${category} habit created successfully`,
      });
      reset();
      setReasons(["", "", ""]);
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create habit",
        variant: "destructive"
      });
    }
  });

  const handleReasonsChange = (index: number, value: string) => {
    const newReasons = [...reasons];
    newReasons[index] = value;
    setReasons(newReasons);
    setValue("reasons", newReasons);
  };

  const onSubmit = (data: NewHabitFormData) => {
    createHabit.mutate({
      ...data,
      reasons: reasons.filter(r => r.trim() !== "")
    });
  };

  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      button: "bg-blue-600 hover:bg-blue-700"
    },
    orange: {
      bg: "bg-orange-50", 
      border: "border-orange-200",
      text: "text-orange-800",
      button: "bg-orange-600 hover:bg-orange-700"
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200", 
      text: "text-emerald-800",
      button: "bg-emerald-600 hover:bg-emerald-700"
    }
  };

  const styles = colorStyles[info.color as keyof typeof colorStyles];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{info.icon}</span>
            Create New {info.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Habit Details */}
          <Card className={`${styles.bg} ${styles.border}`}>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="title" className={styles.text}>Habit Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Daily meditation, Morning workout, Evening prayer"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className={styles.text}>Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Optional description of your habit"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency" className={styles.text}>Frequency</Label>
                  <Select defaultValue="daily" onValueChange={(value) => setValue("frequency", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeOfDay" className={styles.text}>Time of Day</Label>
                  <Select defaultValue="anytime" onValueChange={(value) => setValue("timeOfDay", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning 🌅</SelectItem>
                      <SelectItem value="afternoon">Afternoon ☀️</SelectItem>
                      <SelectItem value="evening">Evening 🌆</SelectItem>
                      <SelectItem value="anytime">Anytime ⏰</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3 Reasons */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Why do you want to build this habit? (3 reasons) *</h3>
              <div className="space-y-3">
                {reasons.map((reason, index) => (
                  <div key={index}>
                    <Label className="text-sm text-gray-600">Reason {index + 1}</Label>
                    <Input
                      value={reason}
                      onChange={(e) => handleReasonsChange(index, e.target.value)}
                      placeholder={`Reason ${index + 1}...`}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              {errors.reasons && (
                <p className="text-sm text-red-500 mt-2">{errors.reasons.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Reminder, Routine, Reward */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Habit Framework *</h3>
              
              <div>
                <Label htmlFor="reminder" className="text-sm text-gray-700">Reminder (Cue)</Label>
                <Input
                  id="reminder"
                  {...register("reminder")}
                  placeholder="e.g., Phone alarm at 7 AM, After breakfast, When I see my workout clothes"
                  className="mt-1"
                />
                {errors.reminder && (
                  <p className="text-sm text-red-500 mt-1">{errors.reminder.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="routine" className="text-sm text-gray-700">Routine (Action)</Label>
                <Input
                  id="routine"
                  {...register("routine")}
                  placeholder="e.g., 10 minutes of meditation, 30 push-ups, Read 5 pages"
                  className="mt-1"
                />
                {errors.routine && (
                  <p className="text-sm text-red-500 mt-1">{errors.routine.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="reward" className="text-sm text-gray-700">Reward (Benefit)</Label>
                <Input
                  id="reward"
                  {...register("reward")}
                  placeholder="e.g., Feel energized, Check off progress, Treat myself to coffee"
                  className="mt-1"
                />
                {errors.reward && (
                  <p className="text-sm text-red-500 mt-1">{errors.reward.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createHabit.isPending}
              className={`flex-1 text-white ${styles.button}`}
            >
              {createHabit.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}