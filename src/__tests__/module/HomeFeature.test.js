import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getDocs, query } from "firebase/firestore";
import { useMediaQuery } from "@uidotdev/usehooks";
import HomeFeature from "module/home/HomeFeature";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  getDocsFromCache: vi.fn(),
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

// Featured posts are a one-off cached read (useCachedQuery)
const servePosts = (ids) =>
  getDocs.mockResolvedValue({
    empty: ids.length === 0,
    docs: ids.map((id) => ({ id, data: () => makePost(id) })),
  });

const ui = (
  <MemoryRouter>
    <HomeFeature />
  </MemoryRouter>
);

describe("HomeFeature", () => {
  // mockReset (vite.config.mjs) clears implementations, so set them per test.
  beforeEach(() => {
    query.mockReturnValue({ name: "featured-posts" });
    servePosts(["a", "b"]);
  });

  it("reads the featured posts once across breakpoints", async () => {
    setScreen("desktop");
    const { rerender } = render(ui);
    await screen.findByText("Post a");

    setScreen("tablet");
    rerender(ui);

    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("shows a grid without the carousel on desktop", async () => {
    setScreen("desktop");
    render(ui);

    expect(await screen.findByText("Post a")).toBeInTheDocument();
    expect(screen.queryByTestId("swiper")).not.toBeInTheDocument();
  });

  it.each([
    ["tablet", "2"],
    ["phone", "1"],
  ])("shows a carousel on %s with %s slide(s) per view", async (size, n) => {
    setScreen(size);
    render(ui);

    const swiper = await screen.findByTestId("swiper");
    expect(swiper).toHaveAttribute("data-slides", n);
    expect(swiper.textContent).toContain("Post a");
  });

  it("renders slides with keys", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation();
    setScreen("tablet");
    render(ui);
    await screen.findByTestId("swiper");

    const keyWarnings = consoleError.mock.calls.filter(([msg]) =>
      String(msg).includes('unique "key" prop')
    );
    expect(keyWarnings).toHaveLength(0);
    consoleError.mockRestore();
  });
});
