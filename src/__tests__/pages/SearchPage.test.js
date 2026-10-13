import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { getDocs, query, where } from "firebase/firestore";
import { theme } from "utils/constants";
import SearchPage from "pages/SearchPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
}));

const posts = [
  { title: "Học React cơ bản", desc: "", categories: [{ name: "Công nghệ" }] },
  { title: "Du lịch Đà Lạt", desc: "Mùa hoa dã quỳ", categories: [] },
  { title: "Nấu ăn", desc: "", user: { fullname: "Lan Anh" } },
];

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  query.mockReturnValue({});
  getDocs.mockResolvedValue({
    docs: posts.map((data, i) => ({
      id: `p${i}`,
      data: () => ({ slug: `p${i}`, createdAt: { seconds: 1 }, ...data }),
    })),
  });
});

describe("SearchPage", () => {
  it("only searches approved posts", () => {
    renderAt("/search?q=react");

    expect(where).toHaveBeenCalledWith("status", "==", 1);
  });

  it("matches without Vietnamese diacritics", async () => {
    renderAt("/search?q=da%20lat");

    expect(await screen.findByText("Du lịch Đà Lạt")).toBeInTheDocument();
    expect(screen.queryByText("Học React cơ bản")).not.toBeInTheDocument();
  });

  it("matches category names", async () => {
    renderAt("/search?q=cong%20nghe");
    expect(await screen.findByText("Học React cơ bản")).toBeInTheDocument();
  });

  it("matches the description", async () => {
    renderAt("/search?q=hoa");
    expect(await screen.findByText("Du lịch Đà Lạt")).toBeInTheDocument();
  });

  it("matches the author", async () => {
    renderAt("/search?q=lan%20anh");
    expect(await screen.findByText("Nấu ăn")).toBeInTheDocument();
  });

  it("says when nothing matches", async () => {
    renderAt("/search?q=python");

    expect(
      await screen.findByText("No posts match your search.")
    ).toBeInTheDocument();
  });

  it("searches what the reader submits", async () => {
    renderAt("/search");

    fireEvent.change(screen.getByRole("searchbox", { name: "Search posts" }), {
      target: { value: "nau an" },
    });
    fireEvent.submit(screen.getByRole("search"));

    expect(await screen.findByText("Nấu ăn")).toBeInTheDocument();
    expect(screen.getByText('Results for "nau an"')).toBeInTheDocument();
  });
});
