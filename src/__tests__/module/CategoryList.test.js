import React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { onSnapshot, query, where } from "firebase/firestore";
import { theme } from "utils/constants";
import CategoryList from "module/home/CategoryList";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));

describe("CategoryList", () => {
  beforeEach(() => {
    query.mockReturnValue({});
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("links every approved category, sorted by name", () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <CategoryList />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(where).toHaveBeenCalledWith("status", "==", 1);

    act(() =>
      onSnapshot.mock.calls[0][1]({
        forEach: (cb) =>
          [
            ["c2", { name: "Du lịch", slug: "du-lich" }],
            ["c1", { name: "Công nghệ", slug: "cong-nghe" }],
          ].forEach(([id, data]) => cb({ id, data: () => data })),
      })
    );

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Công nghệ", "Du lịch"]);
    expect(links[0]).toHaveAttribute("href", "/category/cong-nghe");
  });
});
