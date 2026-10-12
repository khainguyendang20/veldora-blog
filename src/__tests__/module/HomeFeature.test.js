import React from "react";
import { render, act, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { onSnapshot, query } from "firebase/firestore";
import { useMediaQuery } from "@uidotdev/usehooks";
import HomeFeature from "module/home/HomeFeature";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
}));
vi.mock("@uidotdev/usehooks", () => ({ useMediaQuery: vi.fn() }));
// Swiper needs real layout APIs that jsdom lacks.
vi.mock("swiper/react", () => ({
    Swiper: ({ children, slidesPerView }) => (
      <div data-testid="swiper" data-slides={slidesPerView}>
        {children}
      </div>
    ),
  SwiperSlide: ({ children }) => <div>{children}</div>,
}));
vi.mock("swiper/modules", () => ({ A11y: {}, Navigation: {}, Pagination: {} }));

const setScreen = (size) =>
  useMediaQuery.mockImplementation((q) =>
    q.includes("min-width: 1025px")
      ? size === "desktop"
      : q.includes("max-width: 640px")
      ? size === "phone"
      : false
  );

const makePost = (id) => ({
  title: `Post ${id}`,
  slug: `post-${id}`,
  thumbnail: "",
  createdAt: { seconds: 1700000000 },
  categories: [],
  user: { fullname: "Author", username: "author" },
});

const emitPosts = (ids) => {
  const onNext = onSnapshot.mock.calls[onSnapshot.mock.calls.length - 1][1];
  act(() =>
    onNext({
      forEach: (cb) => ids.forEach((id) => cb({ id, data: () => makePost(id) })),
    })
  );
};

const ui = (
  <MemoryRouter>
    <HomeFeature />
  </MemoryRouter>
);

describe("HomeFeature", () => {
  // mockReset (vite.config.mjs) clears implementations, so set them per test.
  beforeEach(() => {
    query.mockReturnValue({ name: "featured-posts" });
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("keeps a single Firestore subscription across breakpoints", () => {
    setScreen("desktop");
    const { rerender } = render(ui);

    setScreen("tablet");
    rerender(ui);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    onSnapshot.mockReturnValue(unsubscribe);
    setScreen("desktop");
    const { unmount } = render(ui);

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("shows a grid without the carousel on desktop", () => {
    setScreen("desktop");
    render(ui);

    emitPosts(["a", "b"]);

    expect(screen.getByText("Post a")).toBeInTheDocument();
    expect(screen.queryByTestId("swiper")).not.toBeInTheDocument();
  });

  it.each([
    ["tablet", "2"],
    ["phone", "1"],
  ])("shows a carousel on %s with %s slide(s) per view", async (size, n) => {
    setScreen(size);
    render(ui);

    emitPosts(["a", "b"]);

    const swiper = await screen.findByTestId("swiper");
    expect(swiper).toHaveAttribute("data-slides", n);
    expect(swiper.textContent).toContain("Post a");
  });

  it("renders slides with keys", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation();
    setScreen("tablet");
    render(ui);

    emitPosts(["a", "b"]);
    await screen.findByTestId("swiper");

    const keyWarnings = consoleError.mock.calls.filter(([msg]) =>
      String(msg).includes('unique "key" prop')
    );
    expect(keyWarnings).toHaveLength(0);
    consoleError.mockRestore();
  });
});
