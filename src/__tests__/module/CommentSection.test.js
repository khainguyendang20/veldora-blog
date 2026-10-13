import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  writeBatch,
} from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import CommentSection from "module/comment/CommentSection";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  increment: vi.fn(),
  writeBatch: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

const post = { id: "p1", status: 1, user: { id: "author" } };

const renderAs = (user, target = post) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <CommentSection post={target} />
      </ThemeProvider>
    </MemoryRouter>
  );
};

const emitComments = (comments) =>
  act(() =>
    onSnapshot.mock.calls[0][1]({
      forEach: (cb) => comments.forEach((c) => cb({ id: c.id, data: () => c })),
    })
  );

const reader = { uid: "r1", role: 3, fullname: "Reader", username: "reader", avatar: "" };

describe("CommentSection", () => {
  let batch;

  beforeEach(() => {
    query.mockReturnValue({ name: "comments" });
    onSnapshot.mockReturnValue(vi.fn());
    collection.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    // doc(collectionRef) makes a new comment id
    doc.mockImplementation((first, ...path) =>
      first?.path
        ? { path: `${first.path}/new`, id: "new" }
        : { path: path.join("/"), id: path[path.length - 1] }
    );
    increment.mockImplementation((n) => ({ increment: n }));
    batch = {
      set: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      commit: vi.fn().mockResolvedValue(),
    };
    writeBatch.mockReturnValue(batch);
  });

  it("lists comments as plain text", () => {
    renderAs(null);
    emitComments([
      { id: "c1", content: "<b>Nice</b> post", user: { id: "x", fullname: "Lan" } },
    ]);

    expect(screen.getByText("Comments (1)")).toBeInTheDocument();
    expect(screen.getByText("<b>Nice</b> post")).toBeInTheDocument();
  });

  it("asks visitors to sign in", () => {
    renderAs(null);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByLabelText("Write a comment")).not.toBeInTheDocument();
  });

  it("posts a trimmed comment under the reader's profile", async () => {
    renderAs(reader);

    fireEvent.change(screen.getByLabelText("Write a comment"), {
      target: { value: "  Great read!  " },
    });
    fireEvent.click(screen.getByText("Post comment"));

    await waitFor(() => expect(batch.commit).toHaveBeenCalledTimes(1));
    expect(batch.set.mock.calls[0][0]).toEqual({
      path: "posts/p1/comments/new",
      id: "new",
    });
    expect(batch.set.mock.calls[0][1]).toMatchObject({
      content: "Great read!",
      user: { id: "r1", fullname: "Reader", username: "reader" },
    });
    // Firestore rules need the counter and the new comment's id together
    expect(batch.update).toHaveBeenCalledWith(
      { path: "posts/p1", id: "p1" },
      { commentCount: { increment: 1 }, lastCommentId: "new" }
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Write a comment")).toHaveValue("")
    );
  });

  it("closes comments on unpublished posts", () => {
    renderAs(reader, { ...post, status: 2 });

    expect(screen.queryByLabelText("Write a comment")).not.toBeInTheDocument();
  });

  it("lets readers delete only their own comments", () => {
    renderAs(reader);
    emitComments([
      { id: "c1", content: "Mine", user: { id: "r1", fullname: "Reader" } },
      { id: "c2", content: "Theirs", user: { id: "x", fullname: "Lan" } },
    ]);

    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(batch.delete).toHaveBeenCalledWith({
      path: "posts/p1/comments/c1",
      id: "c1",
    });
    expect(batch.update).toHaveBeenCalledWith(
      { path: "posts/p1", id: "p1" },
      { commentCount: { increment: -1 }, lastCommentId: "c1" }
    );
  });

  it("lets the post's author moderate every comment", () => {
    renderAs({ ...reader, uid: "author" });
    emitComments([
      { id: "c1", content: "One", user: { id: "r1" } },
      { id: "c2", content: "Two", user: { id: "x" } },
    ]);

    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(2);
  });
});
