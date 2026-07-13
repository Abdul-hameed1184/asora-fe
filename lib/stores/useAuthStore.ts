// store/auth.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth.types";

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;

    login: (token: string, user: User) => void;
    signup: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
    setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,

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

            setHasHydrated: (val) =>
                set({
                    _hasHydrated: val,
                }),
        }),
        {
            name: "auth-storage",
            // Exclude _hasHydrated from localStorage so it always starts false
            // and is only set to true after onRehydrateStorage fires.
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);