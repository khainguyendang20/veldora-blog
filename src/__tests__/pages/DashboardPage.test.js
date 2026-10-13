import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import DashboardPage from "pages/manage/DashboardPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));

const renderAs = (user) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  return render(
    <ThemeProvider theme={theme}>
      <DashboardPage />
    </ThemeProvider>
  );
};

// Firestore rules reject listeners on data the user may not read, so each
// role must only subscribe to what it is allowed to count
describe("DashboardPage", () => {
  beforeEach(() => {
    collection.mockImplementation((db, name) => ({ name }));
    query.mockImplementation((col) => ({ name: `my-${col.name}` }));
    onSnapshot.mockReturnValue(vi.fn());
  });

  const subscribed = () => onSnapshot.mock.calls.map(([ref]) => ref.name);

  it("only counts a regular user's own posts", () => {
    renderAs({ uid: "u1", role: 3 });

    expect(subscribed()).toEqual(["my-posts"]);
  });

  it("counts all posts and categories for mods", () => {
    renderAs({ uid: "u1", role: 2 });

    expect(subscribed()).toEqual(["my-posts", "posts", "categories"]);
  });

  it("also counts users for admins", () => {
    renderAs({ uid: "u1", role: 1 });

    expect(subscribed()).toEqual(["my-posts", "posts", "categories", "users"]);
  });

  it("unsubscribes from every listener on unmount", () => {
    const unsubscribe = vi.fn();
    onSnapshot.mockReturnValue(unsubscribe);
    const { unmount } = renderAs({ uid: "u1", role: 1 });

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(4);
  });
});
