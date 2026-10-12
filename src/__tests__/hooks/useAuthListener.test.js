import React from "react";
import { render, act } from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, query } from "firebase/firestore";
import { useAuthStore } from "store";
import useAuthListener from "hooks/useAuthListener";

jest.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
jest.mock("firebase/auth", () => ({ onAuthStateChanged: jest.fn() }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
}));

const Probe = () => {
  useAuthListener();
  return null;
};

const docsSnapshot = (docs) => ({
  empty: docs.length === 0,
  forEach: (cb) => docs.forEach((data) => cb({ data: () => data })),
});

describe("useAuthListener", () => {
  let emitAuth;
  let unsubscribeAuth;
  let userListeners;

  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthLoading: true });
    unsubscribeAuth = jest.fn();
    onAuthStateChanged.mockImplementation((auth, cb) => {
      emitAuth = (user) => act(() => cb(user));
      return unsubscribeAuth;
    });
    userListeners = [];
    query.mockImplementation(() => ({ name: "user-by-email" }));
    onSnapshot.mockImplementation((q, cb) => {
      const unsubscribe = jest.fn();
      userListeners.push({ emit: (s) => act(() => cb(s)), unsubscribe });
      return unsubscribe;
    });
  });

  it("merges the auth user with their profile document", () => {
    render(<Probe />);
    emitAuth({ uid: "1", email: "a@b.c" });
    userListeners[0].emit(docsSnapshot([{ fullname: "Alice", role: 1 }]));

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
    userListeners[0].emit(docsSnapshot([]));

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
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
