import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Function to store authentication info
const storeAuthToken = (res: Response) => {
  // Check if we're getting auth data back
  const authCookie = res.headers.get('set-cookie');
  if (authCookie) {
    localStorage.setItem('auth_cookie', authCookie);
  }
  
  // Also store user data for apps that might need it
  res.clone().json().then(data => {
    if (data?.user?.id) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
  }).catch(() => {
    // Ignore errors - this is just a backup mechanism
  });
};

export async function apiRequest(
  url: string,
  options?: { method?: string; body?: unknown } | undefined,
): Promise<Response> {
  const method = options?.method || 'GET';
  const data = options?.body;
  
  // Import API configuration
  const { API_BASE_URL } = await import("./api");
  const fullUrl = `${API_BASE_URL}${url}`;
  
  // Add stored auth cookie if it exists and we're in a mobile environment
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (window.location.protocol === 'capacitor:' && localStorage.getItem('auth_cookie')) {
    headers['Cookie'] = localStorage.getItem('auth_cookie') || '';
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Store authentication info if this is a login/register request
  if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
    storeAuthToken(res);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Import API configuration
    const { API_BASE_URL } = await import("./api");
    const fullUrl = `${API_BASE_URL}${queryKey[0] as string}`;
    
    // Add stored auth cookie if it exists and we're in a mobile environment
    const headers: Record<string, string> = {};
    if (window.location.protocol === 'capacitor:' && localStorage.getItem('auth_cookie')) {
      headers['Cookie'] = localStorage.getItem('auth_cookie') || '';
    }
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
