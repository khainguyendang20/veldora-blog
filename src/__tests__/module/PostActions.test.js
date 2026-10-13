import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import PostActions from "module/post/PostActions";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  increment: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
  writeBatch: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

const post = { id: "p1", likeCount: 5 };

const renderAs = (user, target = post) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  const ui = (p) => (
    <MemoryRouter initialEntries={["/post/hello"]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/post/hello" element={<PostActions post={p} />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
  const view = render(ui(target));
  return { rerender: (p) => view.rerender(ui(p)) };
};

describe("PostActions", () => {
  let docListeners;
  let batch;

  beforeEach(() => {
    doc.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    increment.mockImplementation((n) => ({ increment: n }));
    docListeners = {};
    onSnapshot.mockImplementation((ref, cb) => {
      docListeners[ref.path] = cb;
      return vi.fn();
    });
    batch = {
      set: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      commit: vi.fn().mockResolvedValue(),
    };
    writeBatch.mockReturnValue(batch);
    setDoc.mockResolvedValue();
    deleteDoc.mockResolvedValue();
  });

  const likeButton = () => screen.getByRole("button", { name: /like/i });
  const saveButton = () => screen.getByRole("button", { name: /save/i });

  it("shows the post's like count", () => {
    renderAs(null);

    expect(screen.getByText("· 5")).toBeInTheDocument();
  });

  it("sends visitors to sign in", () => {
    renderAs(null);

    fireEvent.click(likeButton());

    expect(toast.info).toHaveBeenCalled();
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(writeBatch).not.toHaveBeenCalled();
  });

  it("likes the post and bumps its counter in one batch", async () => {
    renderAs({ uid: "u1" });

    fireEvent.click(likeButton());

    expect(batch.set).toHaveBeenCalledWith(
      { path: "posts/p1/likes/u1" },
      expect.any(Object)
    );
    expect(batch.update).toHaveBeenCalledWith(
      { path: "posts/p1" },
      { likeCount: { increment: 1 } }
    );
    await waitFor(() => expect(batch.commit).toHaveBeenCalledTimes(1));
    expect(likeButton()).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("· 6")).toBeInTheDocument();
  });

  it("does not count the like twice once the post catches up", () => {
    const { rerender } = renderAs({ uid: "u1" });
    fireEvent.click(likeButton());

    rerender({ ...post, likeCount: 6 });

    expect(screen.getByText("· 6")).toBeInTheDocument();
  });

  it("unlikes a liked post", () => {
    renderAs({ uid: "u1" });
    act(() => docListeners["posts/p1/likes/u1"]({ exists: () => true }));

    fireEvent.click(likeButton());

    expect(batch.delete).toHaveBeenCalledWith({ path: "posts/p1/likes/u1" });
    expect(batch.update).toHaveBeenCalledWith(
      { path: "posts/p1" },
      { likeCount: { increment: -1 } }
    );
    expect(screen.getByText("· 4")).toBeInTheDocument();
  });

  it("undoes the like when the write fails", async () => {
    batch.commit.mockRejectedValue(new Error("permission-denied"));
    renderAs({ uid: "u1" });

    fireEvent.click(likeButton());

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(likeButton()).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("· 5")).toBeInTheDocument();
  });

  it("saves the post to the reader's bookmarks", () => {
    renderAs({ uid: "u1" });

    fireEvent.click(saveButton());

    expect(setDoc).toHaveBeenCalledWith(
      { path: "users/u1/bookmarks/p1" },
      expect.any(Object)
    );
    expect(saveButton()).toHaveTextContent("Saved");
  });
});
