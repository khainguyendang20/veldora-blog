import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  deleteDoc,
  doc,
  getCountFromServer,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import PostActions from "module/post/PostActions";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getCountFromServer: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

const renderAs = (user) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  render(
    <MemoryRouter initialEntries={["/post/hello"]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/post/hello" element={<PostActions postId="p1" />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("PostActions", () => {
  let docListeners;

  beforeEach(() => {
    doc.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    getCountFromServer.mockResolvedValue({ data: () => ({ count: 5 }) });
    docListeners = {};
    onSnapshot.mockImplementation((ref, cb) => {
      docListeners[ref.path] = cb;
      return vi.fn();
    });
    setDoc.mockResolvedValue();
    deleteDoc.mockResolvedValue();
  });

  const likeButton = () => screen.getByRole("button", { name: /like/i });
  const saveButton = () => screen.getByRole("button", { name: /save/i });

  it("shows how many readers liked the post", async () => {
    renderAs(null);

    expect(await screen.findByText("· 5")).toBeInTheDocument();
  });

  it("sends visitors to sign in", () => {
    renderAs(null);

    fireEvent.click(likeButton());

    expect(toast.info).toHaveBeenCalled();
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("likes the post under the reader's uid", async () => {
    renderAs({ uid: "u1" });
    await screen.findByText("· 5");

    fireEvent.click(likeButton());

    expect(setDoc).toHaveBeenCalledWith(
      { path: "posts/p1/likes/u1" },
      expect.objectContaining({})
    );
    expect(likeButton()).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("· 6")).toBeInTheDocument();
  });

  it("unlikes a liked post", async () => {
    renderAs({ uid: "u1" });
    await screen.findByText("· 5");
    act(() => docListeners["posts/p1/likes/u1"]({ exists: () => true }));

    fireEvent.click(likeButton());

    expect(deleteDoc).toHaveBeenCalledWith({ path: "posts/p1/likes/u1" });
    expect(screen.getByText("· 4")).toBeInTheDocument();
  });

  it("undoes the like when the write fails", async () => {
    setDoc.mockRejectedValue(new Error("permission-denied"));
    renderAs({ uid: "u1" });
    await screen.findByText("· 5");

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
      expect.objectContaining({})
    );
    expect(saveButton()).toHaveTextContent("Saved");
  });
});
