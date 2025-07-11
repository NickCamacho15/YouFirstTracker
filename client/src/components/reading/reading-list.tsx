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
    <Card className="bg-background border shadow-md shadow-emerald-500/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xl">My Reading Journey</span>
          </CardTitle>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{pendingBooks.length}</p>
              <p className="text-sm text-muted-foreground">Currently Reading</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{completedBooks.length}</p>
              <p className="text-sm text-muted-foreground">Books Finished</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <div className="space-y-3">
          {/* Pending Books */}
          {pendingBooks.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200 hover:shadow-sm transition-shadow"
            >
              <button
                onClick={() => handleToggleCompleted(book.id, book.isCompleted)}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-emerald-300 hover:border-emerald-500 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{book.title}</p>
                {book.author && (
                  <p className="text-sm text-gray-500 truncate">by {book.author}</p>
                )}
              </div>
              <Button
                onClick={() => handleDeleteBook(book.id)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* Completed Books */}
          {completedBooks.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 opacity-75"
            >
              <button
                onClick={() => handleToggleCompleted(book.id, book.isCompleted)}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors"
              >
                <Check className="w-3 h-3 text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-700 truncate line-through">{book.title}</p>
                {book.author && (
                  <p className="text-sm text-gray-500 truncate">by {book.author}</p>
                )}
              </div>
              <Button
                onClick={() => handleDeleteBook(book.id)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
      </CardContent>
    </Card>
  );
}