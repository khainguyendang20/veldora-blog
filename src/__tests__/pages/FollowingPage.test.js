import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import FollowingPage from "pages/FollowingPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <FollowingPage />
      </ThemeProvider>
    </MemoryRouter>
  );

describe("FollowingPage", () => {
  let followed;

  beforeEach(() => {
    useAuthStore.setState({ user: { uid: "r1" }, isAuthLoading: false });
    collection.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    query.mockImplementation((col) => col);
    followed = ["a1", "a2"];
    getDocs.mockImplementation(async (q) =>
      q.path === "users/r1/following"
        ? { docs: followed.map((id) => ({ id })) }
        : {
            docs: [
              {
                id: "p1",
                data: () => ({ title: "From a1", slug: "p1", createdAt: { seconds: 1 } }),
              },
            ],
          }
    );
  });

  it("shows approved posts by followed authors", async () => {
    renderPage();

    expect(await screen.findByText("From a1")).toBeInTheDocument();
    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(where).toHaveBeenCalledWith("user.id", "in", ["a1", "a2"]);
  });

  it("explains how to follow when the reader follows nobody", async () => {
    followed = [];
    renderPage();

    expect(await screen.findByText(/Follow authors from their profile/)).toBeInTheDocument();
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("asks visitors to sign in", () => {
    useAuthStore.setState({ user: null, isAuthLoading: false });
    renderPage();

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });
});
