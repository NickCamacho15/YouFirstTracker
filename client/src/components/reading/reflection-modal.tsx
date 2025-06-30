import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Book, Clock } from "lucide-react";

interface ReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reflection: string) => void;
  bookTitle: string;
  duration: number;
  isLoading: boolean;
}

export function ReflectionModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  bookTitle, 
  duration, 
  isLoading 
}: ReflectionModalProps) {
  const [reflection, setReflection] = useState("");

  const handleSubmit = () => {
    onSubmit(reflection);
    setReflection("");
  };

  const handleSkip = () => {
    onSubmit("");
    setReflection("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full mx-4 animate-slide-up">
        <DialogHeader>
          <DialogTitle>Reading Session Complete!</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Book className="w-5 h-5 text-accent" />
              <span className="font-medium text-primary">{bookTitle}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-muted-foreground">{duration} minutes</span>
            </div>
          </div>

          {/* Reflection Input */}
          <div>
            <Label htmlFor="reflection">Share your reflection (optional)</Label>
            <Textarea
              id="reflection"
              placeholder="What insights did you gain? What did you learn? How will you apply this knowledge?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your reflection will be shared with the community to inspire others.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
