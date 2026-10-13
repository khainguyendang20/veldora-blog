import React from "react";
import { render, act } from "@testing-library/react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import useAuthListener from "hooks/useAuthListener";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
}));

const Probe = () => {
  useAuthListener();
  return null;
};

const profileSnapshot = (data) => ({ data: () => data });

describe("useAuthListener", () => {
  let emitAuth;
  let unsubscribeAuth;
  let userListeners;

  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthLoading: true });
    unsubscribeAuth = vi.fn();
    onAuthStateChanged.mockImplementation((auth, cb) => {
      emitAuth = (user) => act(() => cb(user));
      return unsubscribeAuth;
    });
    userListeners = [];
    doc.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    onSnapshot.mockImplementation((q, cb) => {
      const unsubscribe = vi.fn();
      userListeners.push({ emit: (s) => act(() => cb(s)), unsubscribe });
      return unsubscribe;
    });
  });

  it("merges the auth user with their profile document", () => {
    render(<Probe />);
    emitAuth({ uid: "1", email: "a@b.c" });
    // Read by uid: profiles no longer store the email
    expect(onSnapshot.mock.calls[0][0]).toEqual({ path: "users/1" });
    userListeners[0].emit(profileSnapshot({ fullname: "Alice", role: 1 }));

    expect(useAuthStore.getState().user).toEqual({
      uid: "1",
      email: "a@b.c",
      fullname: "Alice",
      role: 1,
    });
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
  });

  it("resolves to a null user when signed out", () => {
    render(<Probe />);
    emitAuth(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
  });

  it("resolves to a null user when the profile document is missing", () => {
    render(<Probe />);
    emitAuth({ uid: "1", email: "a@b.c" });
    userListeners[0].emit(profileSnapshot(undefined));

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
  });

  it("signs banned users out", () => {
    render(<Probe />);
    emitAuth({ uid: "1", email: "a@b.c" });
    userListeners[0].emit(profileSnapshot({ fullname: "Alice", status: 3 }));

    expect(useAuthStore.getState().user).toBeNull();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("drops the previous profile listener when the auth user changes", () => {
    render(<Probe />);
    emitAuth({ uid: "1", email: "a@b.c" });
    emitAuth(null);

    expect(userListeners[0].unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes from auth and profile on unmount", () => {
    const { unmount } = render(<Probe />);
    emitAuth({ uid: "1", email: "a@b.c" });

    unmount();

    expect(unsubscribeAuth).toHaveBeenCalledTimes(1);
    expect(userListeners[0].unsubscribe).toHaveBeenCalledTimes(1);
  });
});
