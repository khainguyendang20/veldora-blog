import React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { theme } from "utils/constants";
import HomePage from "pages/HomePage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
}));
// Both sections run their own queries; they have their own tests
vi.mock("module/home/HomeFeature", () => ({ default: () => null }));
vi.mock("module/home/PostsByCategory", () => ({ default: () => null }));
vi.mock("module/home/CategoryList", () => ({ default: () => null }));

const makePost = (n) => ({
  title: `Post ${n}`,
  slug: `post-${n}`,
  thumbnail: "",
  createdAt: { seconds: 1700000000 - n },
  categories: [],
  user: { fullname: "Author" },
});

const renderHome = () =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <HomePage />
      </ThemeProvider>
    </MemoryRouter>
  );

const emitPosts = (count) => {
  const onNext = onSnapshot.mock.calls[0][1];
  const posts = Array.from({ length: count }, (_, i) => makePost(i + 1));
  act(() =>
    onNext({
      forEach: (cb) => posts.forEach((p, i) => cb({ id: `p${i + 1}`, data: () => p })),
    })
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    query.mockReturnValue({ name: "home-posts" });
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("asks for the newest approved posts", () => {
    renderHome();

    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });

  it("shows a spinner while loading", () => {
    renderHome();

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("shows an empty state when there are no posts", () => {
    renderHome();
    emitPosts(0);

    expect(screen.getByText("No posts yet")).toBeInTheDocument();
  });

  it("tells the reader when posts fail to load", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderHome();
    const onError = onSnapshot.mock.calls[0][2];

    act(() => onError(new Error("The query requires an index")));

    expect(screen.getByText("Could not load posts")).toBeInTheDocument();
    expect(screen.queryByText("No posts yet")).not.toBeInTheDocument();
    console.error.mockRestore();
  });

  it("never repeats a post between recent and random sections", () => {
    renderHome();
    emitPosts(13);

    // 9 recent + 4 random, each post shown exactly once
    for (let n = 1; n <= 13; n++) {
      expect(screen.getAllByText(`Post ${n}`)).toHaveLength(1);
    }
    expect(screen.getByText("Random Posts")).toBeInTheDocument();
  });

  it("hides the random section when every post is already recent", () => {
    renderHome();
    emitPosts(5);

    expect(screen.queryByText("Random Posts")).not.toBeInTheDocument();
    expect(screen.getByText("Post 5")).toBeInTheDocument();
  });
});
