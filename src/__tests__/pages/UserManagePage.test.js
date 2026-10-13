import React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import UserManagePage from "pages/manage/UserManagePage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

describe("UserManagePage", () => {
  it("shows emails from the admin-only collection", () => {
    useAuthStore.setState({ user: { uid: "admin", role: 1 }, isAuthLoading: false });
    collection.mockImplementation((db, name) => ({ name }));
    const listeners = {};
    onSnapshot.mockImplementation((q, cb) => {
      listeners[q.name] = cb;
      return vi.fn();
    });
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <UserManagePage />
        </ThemeProvider>
      </MemoryRouter>
    );
    const emit = (name, docs) =>
      act(() =>
        listeners[name]({
          forEach: (cb) => docs.forEach(([id, data]) => cb({ id, data: () => data })),
        })
      );

    emit("users", [["u1", { fullname: "Alice", username: "alice", role: 3, status: 1 }]]);
    emit("userEmails", [["u1", { email: "alice@example.com" }]]);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });
});
