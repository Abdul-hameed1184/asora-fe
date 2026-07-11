// store/auth.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth.types";

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;

    login: (token: string, user: User) => void;
    signup: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                }),
            
            signup: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                }),

            setUser: (user) =>
                set({
                    user,
                }),
        }),
        {
            name: "auth-storage",
        }
    )
);