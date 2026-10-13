import React from "react";
import { render, act, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getDoc, onSnapshot, query, where } from "firebase/firestore";
import { useAuthStore } from "store";
import PostDetailPage from "pages/PostDetailPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

const post = {
  title: "Hello",
  slug: "hello",
  thumbnail: "",
  createdAt: { seconds: 1700000000 },
  user: { id: "u1", fullname: "Author", username: "author" },
  content:
    '<p>Safe text</p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/post/:slug" element={<PostDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("PostDetailPage", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    query.mockReturnValue({ name: "post-by-slug" });
    getDoc.mockResolvedValue({ data: () => undefined });
    useAuthStore.setState({ user: null, isAuthLoading: false });
  });

  it("shows a spinner until the post arrives", () => {
    onSnapshot.mockReturnValue(vi.fn());
    renderAt("/post/hello");

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("waits for the session before querying", () => {
    useAuthStore.setState({ user: null, isAuthLoading: true });
    renderAt("/post/hello");

    expect(onSnapshot).not.toHaveBeenCalled();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("shows the not found page for an unknown slug", () => {
    let onNext;
    onSnapshot.mockImplementation((q, cb) => {
      onNext = cb;
      return vi.fn();
    });
    renderAt("/post/missing");

    act(() => onNext({ forEach: () => {} }));

    expect(screen.getByText("Back to home")).toBeInTheDocument();
  });

  it("strips scripts and event handlers from post content", () => {
    let onNext;
    onSnapshot.mockImplementation((q, cb) => {
      onNext = cb;
      return vi.fn();
    });
    renderAt("/post/hello");

    act(() =>
      onNext({ forEach: (cb) => cb({ id: "p1", data: () => post }) })
    );

    expect(screen.getByText("Safe text")).toBeInTheDocument();
    const html = document.body.innerHTML;
    expect(html).toContain('<img src="x">');
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/<script/i);
  });

  it("unsubscribes from the post on unmount", () => {
    const unsubscribe = vi.fn();
    onSnapshot.mockReturnValue(unsubscribe);
    const { unmount } = renderAt("/post/hello");

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

// Firestore rules reject public queries that could return unapproved posts
describe("PostDetailPage query", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("only asks for approved posts for visitors", () => {
    useAuthStore.setState({ user: null, isAuthLoading: false });
    renderAt("/post/hello");

    expect(where).toHaveBeenCalledWith("status", "==", 1);
  });

  it("lets staff open unapproved posts", () => {
    useAuthStore.setState({
      user: { uid: "u1", role: 2 },
      isAuthLoading: false,
    });
    renderAt("/post/hello");

    expect(where).toHaveBeenCalledWith("slug", "==", "hello");
    expect(where).not.toHaveBeenCalledWith("status", "==", 1);
  });
});
