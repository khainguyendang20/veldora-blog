import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { getDocs, query, where } from "firebase/firestore";
import { theme } from "utils/constants";
import CategoryList from "module/home/CategoryList";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  getDocsFromCache: vi.fn(),
}));

describe("CategoryList", () => {
  beforeEach(() => {
    query.mockReturnValue({});
    getDocs.mockResolvedValue({
      empty: false,
      docs: [
        ["c2", { name: "Du lịch", slug: "du-lich" }],
        ["c1", { name: "Công nghệ", slug: "cong-nghe" }],
      ].map(([id, data]) => ({ id, data: () => data })),
    });
  });

  it("links every approved category, sorted by name", async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <CategoryList />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(where).toHaveBeenCalledWith("status", "==", 1);

    await screen.findByText("Du lịch");

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Công nghệ", "Du lịch"]);
    expect(links[0]).toHaveAttribute("href", "/category/cong-nghe");
  });
});
