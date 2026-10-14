import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import ProfilePage from "pages/ProfilePage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDocsFromCache: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  startAfter: vi.fn(),
  where: vi.fn(),
}));

const renderAt = (username) =>
  render(
    <MemoryRouter initialEntries={[`/profile/${username}`]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );

describe("ProfilePage", () => {
  let users;

  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthLoading: false });
    collection.mockImplementation((db, name) => ({ name }));
    query.mockImplementation((col) => col);
    onSnapshot.mockReturnValue(vi.fn());
    users = [["u1", { fullname: "Lan Pham", username: "lan", description: "Writes about tea." }]];
    getDocs.mockImplementation(async (q) =>
      q.name === "users"
        ? {
            empty: !users.length,
            docs: users.map(([id, data]) => ({ id, data: () => data })),
          }
        : {
            docs: [
              {
                id: "p1",
                data: () => ({ title: "Green tea", slug: "p1", createdAt: { seconds: 1 } }),
              },
            ],
          }
    );
  });

  it("shows a placeholder while the profile loads", () => {
    getDocs.mockReturnValue(new Promise(() => {}));
    renderAt("lan");

    expect(screen.getByRole("status", { name: "Loading profile" })).toBeInTheDocument();
  });

  it("shows the author's bio and published posts", async () => {
    renderAt("lan");

    expect(await screen.findByText("Lan Pham")).toBeInTheDocument();
    expect(screen.getByText("Writes about tea.")).toBeInTheDocument();
    expect(await screen.findByText("Green tea")).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(where).toHaveBeenCalledWith("user.id", "==", "u1");
  });

  it("shows the not found page for an unknown username", async () => {
    users = [];
    renderAt("nobody");

    expect(await screen.findByText("Back to home")).toBeInTheDocument();
  });
});
