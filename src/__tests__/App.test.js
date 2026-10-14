import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import App from "App";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signOut: vi.fn(),
  getRedirectResult: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));
// jsdom has no matchMedia, which useMediaQuery needs.
vi.mock("@uidotdev/usehooks", () => ({
  useWindowSize: () => ({ width: 1280 }),
  useMediaQuery: () => true,
}));

const renderAt = (path, role) => {
  useAuthStore.setState({
    user: role ? { uid: "u1", email: "a@b.c", role } : null,
    isAuthLoading: false,
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
};

describe("App routes", () => {
  beforeEach(() => {
    onAuthStateChanged.mockReturnValue(vi.fn());
    onSnapshot.mockReturnValue(vi.fn());
    getRedirectResult.mockResolvedValue(null);
  });

  it("renders the login page", async () => {
    renderAt("/login");

    expect(
      await screen.findByRole(
        "heading",
        { name: "Welcome back" },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
  });

  it("lets admins open user management", async () => {
    renderAt("/manage/user", userRole.ADMIN);

    expect(await screen.findByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("denies user management to moderators", async () => {
    renderAt("/manage/user", userRole.MOD);

    expect(await screen.findByText("Access Denied")).toBeInTheDocument();
  });

  it("denies category management to regular users", async () => {
    renderAt("/manage/category", userRole.USER);

    expect(await screen.findByText("Access Denied")).toBeInTheDocument();
  });
});
