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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check, Target, Heart, Users, List, Plus, X } from "lucide-react";

const goalSchema = z.object({
  title: z.string().min(1, "Goal is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface NewGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewGoalModal({ open, onOpenChange, onSuccess }: NewGoalModalProps) {
  const [step, setStep] = useState(1);
  const [benefits, setBenefits] = useState<string[]>(["", "", ""]);
  const [peopleHelped, setPeopleHelped] = useState<string[]>(["", "", ""]);
  const [microGoals, setMicroGoals] = useState<string[]>(["", "", "", "", "", "", ""]);
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
    mutationFn: async (data: GoalFormData & { benefits: string[]; peopleHelped: string[]; microGoals: string[] }) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      resetForm();
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

  const resetForm = () => {
    form.reset();
    setStep(1);
    setBenefits(["", "", ""]);
    setPeopleHelped(["", "", ""]);
    setMicroGoals(["", "", "", "", "", "", ""]);
  };

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await form.trigger(["title", "description", "dueDate"]);
      if (!isValid) return;
    } else if (step === 2) {
      const filledBenefits = benefits.filter(b => b.trim() !== "").length;
      if (filledBenefits < 3) {
        toast({
          title: "Add more benefits",
          description: "Please add at least 3 benefits of achieving this goal.",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 3) {
      const filledPeople = peopleHelped.filter(p => p.trim() !== "").length;
      if (filledPeople < 3) {
        toast({
          title: "Add more people",
          description: "Please add at least 3 people who will benefit from this goal.",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 4) {
      const filledMicroGoals = microGoals.filter(mg => mg.trim() !== "").length;
      if (filledMicroGoals < 5) {
        toast({
          title: "Add more steps",
          description: "Please break down your goal into at least 5 smaller steps.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const formData = form.getValues();
    const filteredBenefits = benefits.filter(b => b.trim() !== "");
    const filteredPeople = peopleHelped.filter(p => p.trim() !== "");
    const filteredMicroGoals = microGoals.filter(mg => mg.trim() !== "");
    
    createGoalMutation.mutate({
      ...formData,
      benefits: filteredBenefits,
      peopleHelped: filteredPeople,
      microGoals: filteredMicroGoals,
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const updated = [...benefits];
    updated[index] = value;
    setBenefits(updated);
  };

  const updatePerson = (index: number, value: string) => {
    const updated = [...peopleHelped];
    updated[index] = value;
    setPeopleHelped(updated);
  };

  const updateMicroGoal = (index: number, value: string) => {
    const updated = [...microGoals];
    updated[index] = value;
    setMicroGoals(updated);
  };

  const addBenefit = () => {
    if (benefits.length < 5) {
      setBenefits([...benefits, ""]);
    }
  };

  const addPerson = () => {
    if (peopleHelped.length < 5) {
      setPeopleHelped([...peopleHelped, ""]);
    }
  };

  const removeBenefit = (index: number) => {
    if (benefits.length > 3) {
      setBenefits(benefits.filter((_, i) => i !== index));
    }
  };

  const removePerson = (index: number) => {
    if (peopleHelped.length > 3) {
      setPeopleHelped(peopleHelped.filter((_, i) => i !== index));
    }
  };

  const steps = [
    { number: 1, title: "Set Your Goal", icon: Target },
    { number: 2, title: "List Benefits", icon: Heart },
    { number: 3, title: "Who It Helps", icon: Users },
    { number: 4, title: "Break It Down", icon: List },
    { number: 5, title: "Review & Create", icon: Check },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl w-full mx-4 animate-slide-up">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Goal</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={(step / 5) * 100} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.number} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step >= s.number
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${step >= s.number ? "text-blue-600" : "text-gray-500"}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-4">
            {/* Step 1: Goal Entry */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your goal?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Launch my online business" 
                          className="text-lg"
                          {...field} 
                        />
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
                      <FormLabel>Add more details (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your goal in more detail..."
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
                      <FormLabel>Target date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Benefits */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">What are the benefits of achieving this goal?</h3>
                  <p className="text-sm text-muted-foreground mb-4">List 3-5 benefits you'll gain</p>
                </div>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Benefit ${index + 1}`}
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                    />
                    {benefits.length > 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {benefits.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBenefit}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add another benefit
                  </Button>
                )}
              </div>
            )}

            {/* Step 3: People Helped */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Who will benefit from this goal?</h3>
                  <p className="text-sm text-muted-foreground mb-4">List 3-5 people or groups who will be positively impacted</p>
                </div>
                {peopleHelped.map((person, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Person/Group ${index + 1}`}
                      value={person}
                      onChange={(e) => updatePerson(index, e.target.value)}
                    />
                    {peopleHelped.length > 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePerson(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {peopleHelped.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPerson}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add another person/group
                  </Button>
                )}
              </div>
            )}

            {/* Step 4: Chunk Down */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Break it down into actionable steps</h3>
                  <p className="text-sm text-muted-foreground mb-4">Chunk your goal into 7 smaller tasks</p>
                </div>
                <div className="space-y-2">
                  {microGoals.map((microGoal, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                      <Input
                        placeholder={`Step ${index + 1}`}
                        value={microGoal}
                        onChange={(e) => updateMicroGoal(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Review Your Goal</h3>
                
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-xl mb-2">{form.getValues("title")}</h4>
                    {form.getValues("description") && (
                      <p className="text-muted-foreground mb-4">{form.getValues("description")}</p>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-sm text-blue-600 mb-2">Benefits:</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {benefits.filter(b => b.trim() !== "").map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm text-green-600 mb-2">Who it helps:</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {peopleHelped.filter(p => p.trim() !== "").map((person, i) => (
                            <li key={i}>{person}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm text-purple-600 mb-2">Action steps:</h5>
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          {microGoals.filter(mg => mg.trim() !== "").map((microGoal, i) => (
                            <li key={i}>{microGoal}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <div className={`${step === 1 ? 'ml-auto' : ''} flex space-x-3`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                
                {step < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={createGoalMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}