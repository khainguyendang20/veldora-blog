import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { doc, getDoc, getDocs, query } from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import SavedPostsPage from "pages/manage/SavedPostsPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
}));

describe("SavedPostsPage", () => {
  it("lists saved posts that can still be read", async () => {
    useAuthStore.setState({ user: { uid: "u1" }, isAuthLoading: false });
    query.mockReturnValue({});
    getDocs.mockResolvedValue({
      docs: [{ id: "p1" }, { id: "gone" }, { id: "hidden" }],
    });
    doc.mockImplementation((db, ...path) => path.join("/"));
    getDoc.mockImplementation(async (path) => {
      if (path === "posts/hidden") throw new Error("permission-denied");
      return path === "posts/p1"
        ? {
            id: "p1",
            exists: () => true,
            data: () => ({ title: "Kept", slug: "kept", createdAt: { seconds: 1 } }),
          }
        : { exists: () => false };
    });

    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <SavedPostsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Kept")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });
});
