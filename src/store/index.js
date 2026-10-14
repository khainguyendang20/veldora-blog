import { create } from "zustand";

const initialMode =
  typeof document !== "undefined" &&
  document.documentElement.dataset.theme === "dark"
    ? "dark"
    : "light";

// Light or dark mode. index.html picks the starting mode (saved choice,
// else the system setting) before the app renders.
export const useThemeStore = create((set) => ({
  mode: initialMode,
  toggleMode: () =>
    set((state) => {
      const mode = state.mode === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = mode;
      try {
        localStorage.setItem("theme", mode);
      } catch (error) {
        // Private mode: the choice lasts for this visit only
      }
      return { mode };
    }),
}));

export const useAuthStore = create((set) => ({
  user: null,
  // True until Firebase restores (or rules out) the session on page load
  isAuthLoading: true,
  setCurrentUser: (currentUser) =>
    set({ user: currentUser, isAuthLoading: false }),
}));
