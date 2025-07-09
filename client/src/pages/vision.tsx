import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Move, Upload, Camera } from "lucide-react";

interface VisionBoardItem {
  id: number;
  imageUrl: string;
  caption?: string;
  position: number;
  createdAt: string;
}

const visionItemSchema = z.object({
  imageUrl: z.string().optional(),
  caption: z.string().optional(),
  imageFile: z.any().optional(),
});

type VisionItemFormData = z.infer<typeof visionItemSchema>;

export default function VisionPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: visionItems = [], isLoading } = useQuery<VisionBoardItem[]>({
    queryKey: ["/api/vision-board"],
  });

  const form = useForm<VisionItemFormData>({
    resolver: zodResolver(visionItemSchema),
    defaultValues: {
      imageUrl: "",
      caption: "",
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Quick add function for the uploaded tropical image
  const addTropicalImage = () => {
    createVisionItemMutation.mutate({
      imageUrl: tropicalImage,
      caption: "Tropical Paradise - My Dream Destination"
    });
  };

  const createVisionItemMutation = useMutation({
    mutationFn: async (data: VisionItemFormData) => {
      const response = await fetch("/api/vision-board", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create vision item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision-board"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Vision item added",
        description: "Your vision board item has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vision board item.",
        variant: "destructive",
      });
    },
  });

  const deleteVisionItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/vision-board/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete vision item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vision-board"] });
      toast({
        title: "Vision item removed",
        description: "Your vision board item has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove vision board item.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VisionItemFormData) => {
    createVisionItemMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Vision Board</h1>
              <p className="text-muted-foreground mt-2">
                Create visual representations of your goals and aspirations
              </p>
            </div>
            
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vision Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Vision Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      {...form.register("imageUrl")}
                    />
                    {form.formState.errors.imageUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.imageUrl.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Textarea
                      id="caption"
                      placeholder="Describe your vision..."
                      {...form.register("caption")}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createVisionItemMutation.isPending}
                    >
                      {createVisionItemMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {visionItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <Move className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">Start Your Vision Board</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Add images that represent your goals, dreams, and aspirations. 
                    Visualize your future to make it reality.
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Vision Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visionItems.map((item: VisionBoardItem) => (
                <Card key={item.id} className="overflow-hidden group relative">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Vision board item"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='0.3em' font-family='sans-serif' font-size='16' fill='%236b7280'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVisionItemMutation.mutate(item.id)}
                        disabled={deleteVisionItemMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {item.caption && (
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{item.caption}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}