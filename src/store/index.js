import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  // True until Firebase restores (or rules out) the session on page load
  isAuthLoading: true,
  setCurrentUser: (currentUser) =>
    set({ user: currentUser, isAuthLoading: false }),
}));
