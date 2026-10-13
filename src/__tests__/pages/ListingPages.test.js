import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { getDocs, onSnapshot, query, where } from "firebase/firestore";
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
  onSnapshot: vi.fn(),
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

beforeEach(() => {
  query.mockReturnValue({ name: "q" });
  getDocs.mockResolvedValue({ docs: [post("p1"), post("p2")] });
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
  const emitCategories = (items) => {
    const onNext = onSnapshot.mock.calls[0][1];
    act(() =>
      onNext({
        forEach: (cb) => items.forEach(([id, data]) => cb({ id, data: () => data })),
      })
    );
  };

  beforeEach(() => {
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("shows the category's approved posts", async () => {
    renderAt("/category/tech");
    expect(where).toHaveBeenCalledWith("slug", "==", "tech");

    emitCategories([["c1", { name: "Technology", slug: "tech", status: 1 }]]);

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(await screen.findByText("Post p1")).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith("categoryIds", "array-contains", "c1");
  });

  it("shows the not found page for an unknown category", async () => {
    renderAt("/category/missing");

    emitCategories([]);

    expect(screen.getByText("Back to home")).toBeInTheDocument();
    await waitFor(() => expect(getDocs).not.toHaveBeenCalled());
  });
});
