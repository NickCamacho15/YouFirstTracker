import { apiRequest } from "./queryClient";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  displayName: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  displayName: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  register: async (data: RegisterData): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getCurrentUser: async (): Promise<{ user: User } | null> => {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    } catch (error) {
      return null;
    }
  },
};
