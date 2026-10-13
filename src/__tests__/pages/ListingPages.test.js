import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { collection, getDocs, query, where } from "firebase/firestore";
import { theme } from "utils/constants";
import BlogPage from "pages/BlogPage";
import CategoryPage from "pages/CategoryPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  getDocs: vi.fn(),
  getDocsFromCache: vi.fn(),
}));

const post = (id) => ({
  id,
  data: () => ({
    title: `Post ${id}`,
    slug: id,
    createdAt: { seconds: 1700000000 },
    categories: [{ id: "c1", name: "Tech", slug: "tech" }],
    user: { fullname: "Author" },
  }),
});

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );

let categories = [];

beforeEach(() => {
  collection.mockImplementation((db, name) => ({ name }));
  query.mockImplementation((col) => col);
  categories = [];
  getDocs.mockImplementation(async (q) =>
    q.name === "categories"
      ? {
          empty: categories.length === 0,
          docs: categories.map(([id, data]) => ({ id, data: () => data })),
        }
      : { docs: [post("p1"), post("p2")] }
  );
});

describe("BlogPage", () => {
  it("lists approved posts", async () => {
    renderAt("/blog");

    expect(await screen.findByText("Post p1")).toBeInTheDocument();
    expect(screen.getByText("Post p2")).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith("status", "==", 1);
  });

  it("links each post's category to its page", async () => {
    renderAt("/blog");

    const [link] = await screen.findAllByRole("link", { name: "Tech" });
    expect(link).toHaveAttribute("href", "/category/tech");
  });
});

describe("CategoryPage", () => {
  it("shows the category's approved posts", async () => {
    categories = [["c1", { name: "Technology", slug: "tech", status: 1 }]];
    renderAt("/category/tech");
    expect(where).toHaveBeenCalledWith("slug", "==", "tech");

    expect(await screen.findByText("Technology")).toBeInTheDocument();
    expect(await screen.findByText("Post p1")).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith("categoryIds", "array-contains", "c1");
  });

  it("shows the not found page for an unknown category", async () => {
    renderAt("/category/missing");

    expect(await screen.findByText("Back to home")).toBeInTheDocument();
    // Only the category lookup ran; no posts were requested
    expect(getDocs).toHaveBeenCalledTimes(1);
  });
});
