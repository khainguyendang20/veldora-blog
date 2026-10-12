import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import App from "App";

jest.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));
// ESM-only package that CRA's Jest cannot transform.
jest.mock("@uidotdev/usehooks", () => ({
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
    onAuthStateChanged.mockReturnValue(jest.fn());
    onSnapshot.mockReturnValue(jest.fn());
  });

  it("renders the login page", async () => {
    renderAt("/login");

    expect(
      await screen.findByText("Email Address", {}, { timeout: 5000 })
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
