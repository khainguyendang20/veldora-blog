import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { onSnapshot, query } from "firebase/firestore";
import { useWindowSize } from "@uidotdev/usehooks";
import HomeFeature from "module/home/HomeFeature";

jest.mock("config/firebase-config", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));
jest.mock("@uidotdev/usehooks", () => ({ useWindowSize: jest.fn() }));
// Swiper is ESM-only with an exports map that CRA's Jest 27 cannot resolve.
jest.mock(
  "swiper/react",
  () => ({
    Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }) => <div>{children}</div>,
  }),
  { virtual: true }
);
jest.mock("swiper/modules", () => ({}), { virtual: true });

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

const renderFeature = () =>
  render(
    <MemoryRouter>
      <HomeFeature />
    </MemoryRouter>
  );

describe("HomeFeature", () => {
  // CRA enables resetMocks, so implementations are set per test.
  beforeEach(() => {
    query.mockReturnValue({ name: "featured-posts" });
    onSnapshot.mockReturnValue(jest.fn());
  });

  it("keeps a single Firestore subscription when the window resizes", () => {
    useWindowSize.mockReturnValue({ width: 1280 });
    const { rerender } = renderFeature();

    useWindowSize.mockReturnValue({ width: 800 });
    rerender(
      <MemoryRouter>
        <HomeFeature />
      </MemoryRouter>
    );

    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    onSnapshot.mockReturnValue(unsubscribe);
    useWindowSize.mockReturnValue({ width: 1280 });
    const { unmount } = renderFeature();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("renders slides with keys on small screens", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    useWindowSize.mockReturnValue({ width: 800 });
    const { getByTestId } = renderFeature();

    emitPosts(["a", "b"]);

    expect(getByTestId("swiper").textContent).toContain("Post a");
    const keyWarnings = consoleError.mock.calls.filter(([msg]) =>
      String(msg).includes('unique "key" prop')
    );
    expect(keyWarnings).toHaveLength(0);
    consoleError.mockRestore();
  });
});
