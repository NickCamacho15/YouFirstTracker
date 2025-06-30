import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: number;
  email: string;
  displayName: string;
}

export function useAuth() {
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user,
    isLoading,
    refetch,
  };
}
