import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import FollowButton from "module/follow/FollowButton";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

const renderAs = (user, authorId = "author") => {
  useAuthStore.setState({ user, isAuthLoading: false });
  return render(
    <MemoryRouter initialEntries={["/profile/a"]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/profile/a" element={<FollowButton authorId={authorId} />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("FollowButton", () => {
  let emit;

  beforeEach(() => {
    doc.mockImplementation((db, ...path) => path.join("/"));
    onSnapshot.mockImplementation((ref, cb) => {
      emit = cb;
      return vi.fn();
    });
    setDoc.mockResolvedValue();
    deleteDoc.mockResolvedValue();
  });

  it("follows the author under the reader's account", () => {
    renderAs({ uid: "r1" });

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    expect(setDoc).toHaveBeenCalledWith("users/r1/following/author", expect.any(Object));
    expect(screen.getByRole("button", { name: "Following" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("unfollows", () => {
    renderAs({ uid: "r1" });
    act(() => emit({ exists: () => true }));

    fireEvent.click(screen.getByRole("button", { name: "Following" }));

    expect(deleteDoc).toHaveBeenCalledWith("users/r1/following/author");
  });

  it("undoes the change when the write fails", async () => {
    setDoc.mockRejectedValue(new Error("permission-denied"));
    renderAs({ uid: "r1" });

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
  });

  it("is hidden on the reader's own profile", () => {
    renderAs({ uid: "author" });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("sends visitors to sign in", () => {
    renderAs(null);

    fireEvent.click(screen.getByRole("button", { name: "Follow" }));

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(setDoc).not.toHaveBeenCalled();
  });
});
