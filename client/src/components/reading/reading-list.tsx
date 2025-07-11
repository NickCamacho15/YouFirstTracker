import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Check, X, Trophy, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ReadingListItem {
  id: number;
  title: string;
  author?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export function ReadingList() {
  const [newBook, setNewBook] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: readingList = [], isLoading } = useQuery({
    queryKey: ["/api/reading-list"],
  });

  const addBookMutation = useMutation({
    mutationFn: async (data: { title: string; author?: string }) => {
      const response = await apiRequest("POST", "/api/reading-list", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-list"] });
      setNewBook("");
      setNewAuthor("");
      setIsAdding(false);
      toast({ title: "Book added!", description: "Added to your reading list." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add book",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleCompletedMutation = useMutation({
    mutationFn: async (data: { id: number; isCompleted: boolean }) => {
      const response = await apiRequest("PATCH", `/api/reading-list/${data.id}`, {
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date().toISOString() : null,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-list"] });
      toast({
        title: variables.isCompleted ? "Book completed! 🎉" : "Book moved back to reading list",
        description: variables.isCompleted ? "Great job finishing another book!" : "Keep reading!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/reading-list/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-list"] });
      toast({ title: "Book removed", description: "Removed from your reading list." });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddBook = () => {
    if (!newBook.trim()) return;
    
    addBookMutation.mutate({
      title: newBook.trim(),
      author: newAuthor.trim() || undefined,
    });
  };

  const handleToggleCompleted = (id: number, currentStatus: boolean) => {
    toggleCompletedMutation.mutate({ id, isCompleted: !currentStatus });
  };

  const handleDeleteBook = (id: number) => {
    deleteBookMutation.mutate(id);
  };

  const completedBooks = (readingList as ReadingListItem[]).filter(book => book.isCompleted);
  const pendingBooks = (readingList as ReadingListItem[]).filter(book => !book.isCompleted);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">Loading reading list...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3 bg-white border shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-lg font-semibold text-foreground">{pendingBooks.length}</p>
              <p className="text-xs text-muted-foreground">Reading</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 bg-white border shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-lg font-semibold text-foreground">{completedBooks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        {/* Add New Book */}
        {!isAdding ? (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book to List
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Book title"
              value={newBook}
              onChange={(e) => setNewBook(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBook()}
            />
            <Input
              placeholder="Author (optional)"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBook()}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddBook}
                disabled={!newBook.trim() || addBookMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Add Book
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewBook("");
                  setNewAuthor("");
                }}
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Reading List */}
        <div className="space-y-2">
          {/* Pending Books */}
          {pendingBooks.map((book) => (
            <Card
              key={book.id}
              className="p-2.5 bg-white border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleCompleted(book.id, book.isCompleted)}
                  className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-emerald-400 hover:border-emerald-500 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{book.title}</p>
                  {book.author && (
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleDeleteBook(book.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-0.5 h-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Completed Books */}
          {completedBooks.map((book) => (
            <Card
              key={book.id}
              className="p-2.5 bg-emerald-50 border border-emerald-200 shadow-sm opacity-75"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleCompleted(book.id, book.isCompleted)}
                  className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-700 truncate line-through">{book.title}</p>
                  {book.author && (
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleDeleteBook(book.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-0.5 h-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {readingList.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-700 font-medium">No books in your list yet</p>
            <p className="text-sm text-emerald-600 mt-1">Add your first book to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}