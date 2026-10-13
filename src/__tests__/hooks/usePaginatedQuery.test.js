import { act, renderHook, waitFor } from "@testing-library/react";
import { getDocs, limit, query, startAfter } from "firebase/firestore";
import usePaginatedQuery from "hooks/usePaginatedQuery";

vi.mock("firebase/firestore", () => ({
  getDocs: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
}));

beforeEach(() => {
  query.mockImplementation((q, ...constraints) => ({ ...q, constraints }));
  limit.mockImplementation((n) => ({ limit: n }));
  startAfter.mockImplementation((doc) => ({ startAfter: doc.id }));
});

const snapshotOf = (ids) => ({
  docs: ids.map((id) => ({ id, data: () => ({ title: `Post ${id}` }) })),
});

const ids = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => `p${from + i}`);

describe("usePaginatedQuery", () => {
  it("loads the first page and detects that more exist", async () => {
    getDocs.mockResolvedValue(snapshotOf(ids(1, 3)));
    const { result } = renderHook(() =>
      usePaginatedQuery(() => ({ name: "posts" }), [], 2)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // One extra document is requested to know if there is another page
    expect(limit).toHaveBeenCalledWith(3);
    expect(result.current.data.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(result.current.hasMore).toBe(true);
  });

  it("appends the next page after the last shown document", async () => {
    getDocs.mockResolvedValueOnce(snapshotOf(ids(1, 3)));
    getDocs.mockResolvedValueOnce(snapshotOf(ids(3, 4)));
    const { result } = renderHook(() =>
      usePaginatedQuery(() => ({ name: "posts" }), [], 2)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.loadMore());

    expect(startAfter).toHaveBeenCalledWith(expect.objectContaining({ id: "p2" }));
    expect(result.current.data.map((p) => p.id)).toEqual(["p1", "p2", "p3", "p4"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("restarts from the first page when deps change", async () => {
    getDocs.mockResolvedValue(snapshotOf(ids(1, 1)));
    const { result, rerender } = renderHook(
      ({ slug }) => usePaginatedQuery(() => ({ slug }), [slug], 2),
      { initialProps: { slug: "a" } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    getDocs.mockResolvedValue(snapshotOf(["q1"]));
    rerender({ slug: "b" });

    await waitFor(() =>
      expect(result.current.data.map((p) => p.id)).toEqual(["q1"])
    );
    expect(query).toHaveBeenLastCalledWith({ slug: "b" }, { limit: 3 });
    expect(result.current.data).toHaveLength(1);
  });

  it("does not load when the builder returns null", () => {
    const { result } = renderHook(() => usePaginatedQuery(() => null, [], 2));

    expect(getDocs).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("exposes errors instead of loading forever", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("missing index");
    getDocs.mockRejectedValue(error);
    const { result } = renderHook(() =>
      usePaginatedQuery(() => ({ name: "posts" }), [], 2)
    );

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.loading).toBe(false);
    console.error.mockRestore();
  });
});
