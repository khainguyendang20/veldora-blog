import React from "react";
import { render, act, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
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
  updateDoc: vi.fn(),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const renderAs = (user, path = "/manage/post") => {
  useAuthStore.setState({ user, isAuthLoading: false });
  return render(
    <MemoryRouter initialEntries={[path]}>
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

describe("PostManagePage moderation", () => {
  const posts = [
    ["p1", "Draft one", 2],
    ["p2", "Live one", 1],
    ["p3", "Draft two", 2],
  ];

  beforeEach(() => {
    collection.mockReturnValue({ name: "posts" });
    query.mockReturnValue({ name: "own-posts" });
    doc.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    updateDoc.mockResolvedValue();
    onSnapshot.mockReturnValue(vi.fn());
  });

  const emitPosts = () => {
    const onNext = onSnapshot.mock.calls[0][1];
    act(() =>
      onNext({
        forEach: (cb) =>
          posts.forEach(([id, title, status]) =>
            cb({ id, data: () => ({ title, status, user: {}, categories: [] }) })
          ),
      })
    );
  };

  it("filters by status and shows how many posts each has", () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emitPosts();

    fireEvent.click(screen.getByRole("button", { name: "Pending (2)" }));

    expect(screen.getByText("Draft one")).toBeInTheDocument();
    expect(screen.getByText("Draft two")).toBeInTheDocument();
    expect(screen.queryByText("Live one")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All (3)" })).toBeInTheDocument();
  });

  it("lets staff approve a pending post in one click", async () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emitPosts();

    fireEvent.click(screen.getAllByRole("button", { name: "Approve" })[0]);

    expect(updateDoc).toHaveBeenCalledWith({ path: "posts/p1" }, { status: 1 });
    await act(() => Promise.resolve());
    expect(toast.success).toHaveBeenCalledWith('Approved "Draft one"');
  });

  it("does not offer moderation to regular users", () => {
    renderAs({ uid: "u2", role: userRole.USER });
    emitPosts();

    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
  });

  it("opens the filter named in the address", () => {
    renderAs({ uid: "u1", role: userRole.MOD }, "/manage/post?status=pending");
    emitPosts();

    expect(screen.getByRole("button", { name: "Pending (2)" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByText("Live one")).not.toBeInTheDocument();
  });
});

describe("PostManagePage featured posts", () => {
  beforeEach(() => {
    collection.mockReturnValue({ name: "posts" });
    query.mockReturnValue({ name: "own-posts" });
    doc.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    updateDoc.mockResolvedValue();
    onSnapshot.mockReturnValue(vi.fn());
  });

  // [id, title, status, featured]
  const emit = (posts) => {
    const onNext = onSnapshot.mock.calls[0][1];
    act(() =>
      onNext({
        forEach: (cb) =>
          posts.forEach(([id, title, status, featured]) =>
            cb({
              id,
              data: () => ({ title, status, featured, user: {}, categories: [] }),
            })
          ),
      })
    );
  };
  // Stars in row order
  const stars = () =>
    screen.getAllByRole("button", { name: "Feature on the home page" });

  it("shows how many home page slots are used and lists those posts", () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emit([
      ["p1", "On the home page", 1, true],
      ["p2", "Not featured", 1, false],
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Featured (1/4)" }));

    expect(screen.getByText("On the home page")).toBeInTheDocument();
    expect(screen.queryByText("Not featured")).not.toBeInTheDocument();
  });

  it("features an approved post with one click", async () => {
    localStorage.setItem("query-cache:home:featured", String(Date.now() + 60000));
    renderAs({ uid: "u1", role: userRole.MOD });
    emit([["p1", "Live one", 1, false]]);

    const star = stars()[0];
    expect(star).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(star);

    expect(updateDoc).toHaveBeenCalledWith({ path: "posts/p1" }, { featured: true });
    await act(() => Promise.resolve());
    expect(toast.success).toHaveBeenCalledWith('Featured "Live one" on the home page');
    // This browser's next home page visit fetches the new list
    expect(localStorage.getItem("query-cache:home:featured")).toBe("0");
  });

  it("removes a featured post from the home page", () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emit([["p1", "Live one", 1, true]]);

    const star = stars()[0];
    expect(star).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(star);

    expect(updateDoc).toHaveBeenCalledWith({ path: "posts/p1" }, { featured: false });
  });

  it("explains why a post that isn't live can't be featured", () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emit([["p1", "Waiting", 2, false]]);

    const star = stars()[0];
    expect(star).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(star);

    expect(updateDoc).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith(
      "Only approved or scheduled posts can be featured."
    );
  });

  it("lets a scheduled post be featured ahead of time", () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emit([["p1", "Coming soon", 5, false]]);

    fireEvent.click(stars()[0]);

    expect(updateDoc).toHaveBeenCalledWith({ path: "posts/p1" }, { featured: true });
  });

  it("won't feature more posts than the home page shows", () => {
    renderAs({ uid: "u1", role: userRole.MOD });
    emit([
      ["p1", "One", 1, true],
      ["p2", "Two", 1, true],
      ["p3", "Three", 1, true],
      ["p4", "Four", 1, true],
      ["p5", "Five", 1, false],
    ]);

    fireEvent.click(stars()[4]);

    expect(updateDoc).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith(
      "The home page shows 4 featured posts. Unfeature one first."
    );
    expect(screen.getByRole("button", { name: "Featured (4/4)" })).toBeInTheDocument();
  });

  it("is only for staff", () => {
    renderAs({ uid: "u2", role: userRole.USER });
    emit([["p1", "Mine", 1, false]]);

    expect(
      screen.queryByRole("button", { name: "Feature on the home page" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Featured/ })).not.toBeInTheDocument();
  });
});

describe("PostManagePage loading", () => {
  it("shows placeholder rows, not the empty state, until posts arrive", () => {
    collection.mockReturnValue({ name: "posts" });
    onSnapshot.mockReturnValue(vi.fn());
    renderAs({ uid: "u1", role: userRole.MOD });

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.queryByText("No posts here yet.")).not.toBeInTheDocument();
  });
});
