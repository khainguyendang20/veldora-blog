import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { getDocs, orderBy, query, where } from "firebase/firestore";
import { theme } from "utils/constants";
import HomePage from "pages/HomePage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  getDocsFromCache: vi.fn(),
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

// Home posts are a one-off cached read (useCachedQuery)
const servePosts = (count) => {
  const posts = Array.from({ length: count }, (_, i) => makePost(i + 1));
  getDocs.mockResolvedValue({
    empty: count === 0,
    docs: posts.map((p, i) => ({ id: `p${i + 1}`, data: () => p })),
  });
};

describe("HomePage", () => {
  beforeEach(() => {
    query.mockReturnValue({ name: "home-posts" });
    getDocs.mockReturnValue(new Promise(() => {}));
  });

  it("asks for the newest approved posts", () => {
    renderHome();

    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });

  it("shows a placeholder while loading", () => {
    renderHome();

    expect(screen.getByRole("status", { name: /^Loading/ })).toBeInTheDocument();
  });

  it("shows an empty state when there are no posts", async () => {
    servePosts(0);
    renderHome();

    expect(await screen.findByText("No posts yet")).toBeInTheDocument();
  });

  it("tells the reader when posts fail to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getDocs.mockRejectedValue(new Error("The query requires an index"));
    renderHome();

    expect(await screen.findByText("Could not load posts")).toBeInTheDocument();
    expect(screen.queryByText("No posts yet")).not.toBeInTheDocument();
    console.error.mockRestore();
  });

  it("never repeats a post between recent and random sections", async () => {
    servePosts(13);
    renderHome();
    await screen.findByText("Post 1");

    // 9 recent + 4 random, each post shown exactly once
    for (let n = 1; n <= 13; n++) {
      expect(screen.getAllByText(`Post ${n}`)).toHaveLength(1);
    }
    expect(screen.getByText("Random Posts")).toBeInTheDocument();
  });

  it("hides the random section when every post is already recent", async () => {
    servePosts(5);
    renderHome();
    await screen.findByText("Post 1");

    expect(screen.queryByText("Random Posts")).not.toBeInTheDocument();
    expect(screen.getByText("Post 5")).toBeInTheDocument();
  });
});
