import { create } from "zustand";
import { User } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    set({ token: null, user: null, isLoggedIn: false });
  },

  initialize: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isLoggedIn: true });
      } catch (error) {
        console.error("Failed to initialize auth store:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
  },
}));
