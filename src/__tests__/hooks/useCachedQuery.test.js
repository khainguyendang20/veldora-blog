import { renderHook, waitFor } from "@testing-library/react";
import { getDocs, getDocsFromCache } from "firebase/firestore";
import useCachedQuery from "hooks/useCachedQuery";

vi.mock("firebase/firestore", () => ({
  getDocs: vi.fn(),
  getDocsFromCache: vi.fn(),
}));

const snapshotOf = (ids) => ({
  empty: ids.length === 0,
  docs: ids.map((id) => ({ id, data: () => ({ title: id }) })),
});

describe("useCachedQuery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true, now: 1_000_000 });
  });

  afterEach(() => vi.useRealTimers());

  const render = () =>
    renderHook(() => useCachedQuery("home", () => ({ name: "q" }), []));

  it("fetches from the server the first time", async () => {
    getDocs.mockResolvedValue(snapshotOf(["a", "b"]));
    const { result } = render();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.map((d) => d.id)).toEqual(["a", "b"]);
    expect(getDocsFromCache).not.toHaveBeenCalled();
  });

  it("serves a recent result from the local cache without a read", async () => {
    getDocs.mockResolvedValue(snapshotOf(["a"]));
    const view = render();
    await waitFor(() => expect(view.result.current.loading).toBe(false));
    view.unmount();

    getDocsFromCache.mockResolvedValue(snapshotOf(["a"]));
    const { result } = render();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getDocsFromCache).toHaveBeenCalledTimes(1);
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("goes back to the server once the result is too old", async () => {
    getDocs.mockResolvedValue(snapshotOf(["a"]));
    const view = render();
    await waitFor(() => expect(view.result.current.loading).toBe(false));
    view.unmount();

    vi.setSystemTime(1_000_000 + 6 * 60 * 1000);
    const { result } = render();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getDocsFromCache).not.toHaveBeenCalled();
    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  it("falls back to the server when the cache was cleared", async () => {
    localStorage.setItem("query-cache:home", String(1_000_000 + 60_000));
    getDocsFromCache.mockResolvedValue(snapshotOf([]));
    getDocs.mockResolvedValue(snapshotOf(["a"]));
    const { result } = render();

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("exposes errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("quota exceeded");
    getDocs.mockRejectedValue(error);
    const { result } = render();

    await waitFor(() => expect(result.current.error).toBe(error));
    console.error.mockRestore();
  });
});
