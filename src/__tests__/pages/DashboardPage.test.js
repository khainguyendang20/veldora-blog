import React from "react";
import { act, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter } from "react-router-dom";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import DashboardPage from "pages/manage/DashboardPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getCountFromServer: vi.fn(),
}));

const counts = { "my-posts": 2, pending: 3, posts: 10, categories: 4, users: 7 };

const renderAs = (user) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <DashboardPage />
      </ThemeProvider>
    </MemoryRouter>
  );
};

// Firestore rules reject counts over data the user may not read, so each
// role must only count what it is allowed to see
describe("DashboardPage", () => {
  beforeEach(() => {
    collection.mockImplementation((db, name) => ({ name }));
    where.mockImplementation((field, op, value) => ({ field, value }));
    query.mockImplementation((col, clause) => ({
      name: clause.field === "status" ? "pending" : "my-posts",
    }));
    getCountFromServer.mockImplementation(async (q) => ({
      data: () => ({ count: counts[q.name] }),
    }));
  });

  const counted = () => getCountFromServer.mock.calls.map(([q]) => q.name);

  it("only counts a regular user's own posts", async () => {
    renderAs({ uid: "u1", role: 3 });

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(counted()).toEqual(["my-posts"]);
    expect(where).toHaveBeenCalledWith("user.id", "==", "u1");
    expect(screen.queryByText("Pending review")).not.toBeInTheDocument();
  });

  it("shows mods the moderation queue and totals", async () => {
    renderAs({ uid: "u1", role: 2 });

    expect(await screen.findByText("Pending review")).toBeInTheDocument();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(counted()).toEqual(["my-posts", "pending", "posts", "categories"]);
  });

  it("also counts users for admins", async () => {
    renderAs({ uid: "u1", role: 1 });

    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(counted()).toContain("users");
  });

  it("does not re-count when unrelated profile fields change", async () => {
    renderAs({ uid: "u1", role: 3, fullname: "A" });
    await screen.findByText("2");

    act(() =>
      useAuthStore.setState({ user: { uid: "u1", role: 3, fullname: "B" } })
    );

    expect(getCountFromServer).toHaveBeenCalledTimes(1);
  });

  it("links staff from the pending count to the review queue", async () => {
    renderAs({ uid: "u1", role: 2 });

    const card = await screen.findByRole("link", { name: /Pending review/ });
    expect(card).toHaveAttribute("href", "/manage/post?status=pending");
    expect(
      await screen.findByRole("button", { name: "Review 3 pending" })
    ).toBeInTheDocument();
  });
});
