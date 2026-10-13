import React from "react";
import { render, act, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import PostManagePage from "pages/manage/PostManagePage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  deleteDoc: vi.fn(),
}));

const renderAs = (user) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  return render(
    <MemoryRouter>
      <PostManagePage />
    </MemoryRouter>
  );
};

describe("PostManagePage", () => {
  beforeEach(() => {
    collection.mockReturnValue({ name: "posts" });
    query.mockReturnValue({ name: "own-posts" });
    where.mockReturnValue("user.id == u2");
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("lists every post for moderators", () => {
    renderAs({ uid: "u1", role: userRole.MOD });

    expect(onSnapshot.mock.calls[0][0]).toEqual({ name: "posts" });
  });

  it("lists only their own posts for regular users", () => {
    renderAs({ uid: "u2", role: userRole.USER });

    expect(where).toHaveBeenCalledWith("user.id", "==", "u2");
    expect(onSnapshot.mock.calls[0][0]).toEqual({ name: "own-posts" });
  });

  it("filters posts by title after the search input settles", () => {
    vi.useFakeTimers();
    renderAs({ uid: "u1", role: userRole.ADMIN });
    const onNext = onSnapshot.mock.calls[0][1];
    act(() =>
      onNext({
        forEach: (cb) =>
          [
            ["p1", "React hooks"],
            ["p2", "Firebase rules"],
          ].forEach(([id, title]) =>
            cb({ id, data: () => ({ title, user: {}, categories: [] }) })
          ),
      })
    );

    fireEvent.change(screen.getByPlaceholderText("Type to search..."), {
      target: { value: "fire" },
    });
    expect(screen.getByText("React hooks")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(500));

    expect(screen.queryByText("React hooks")).not.toBeInTheDocument();
    expect(screen.getByText("Firebase rules")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps one subscription when unrelated profile fields change", () => {
    renderAs({ uid: "u2", role: userRole.USER, fullname: "A" });

    act(() =>
      useAuthStore.setState({
        user: { uid: "u2", role: userRole.USER, fullname: "B" },
      })
    );

    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });
});
