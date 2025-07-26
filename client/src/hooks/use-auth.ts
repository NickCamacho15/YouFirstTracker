import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { useState, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  displayName: string;
}

export function useAuth() {
  // For mobile environments, we'll use localStorage as a backup
  const [localUser, setLocalUser] = useState<User | null>(null);

  // Try to load user from localStorage on component mount (for mobile)
  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        setLocalUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data", e);
      }
    }
  }, []);

  const {
    data: serverUser,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    onSuccess: (userData) => {
      // If we got user data from the server, update localStorage
      if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
        setLocalUser(userData);
      }
    },
  });

  // Combine the two sources - server is the source of truth when available
  const user = serverUser || localUser;

  // Enhanced logout that clears local storage too
  const logout = async () => {
    try {
      // Clear local storage auth data
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_cookie');
      setLocalUser(null);
      
      // Also call the server logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Refetch to confirm logout
      refetch();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return {
    user,
    isLoading,
    refetch,
    logout,
  };
}
