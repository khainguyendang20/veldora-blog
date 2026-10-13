import React from "react";
import { render, act } from "@testing-library/react";
import { onSnapshot } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";

vi.mock("firebase/firestore", () => ({
  onSnapshot: vi.fn(),
}));

// RTL 12 has no renderHook, so run the hook inside a probe component.
const renderHook = (callback, { initialProps } = {}) => {
  const result = {};
  const Probe = (props) => {
    result.current = callback(props);
    return null;
  };
  const utils = render(<Probe {...initialProps} />);
  return {
    result,
    unmount: utils.unmount,
    rerender: (props) => utils.rerender(<Probe {...props} />),
  };
};

const makeSnapshot = (docs) => ({
  forEach: (cb) =>
    docs.forEach(({ id, data }) => cb({ id, data: () => data })),
});

describe("useFirestoreQuery", () => {
  let listeners;
  let unsubscribes;

  beforeEach(() => {
    listeners = [];
    unsubscribes = [];
    onSnapshot.mockReset();
    onSnapshot.mockImplementation((q, onNext) => {
      listeners.push({ q, onNext });
      const unsubscribe = vi.fn();
      unsubscribes.push(unsubscribe);
      return unsubscribe;
    });
  });

  it("subscribes to the built query and maps docs to { id, ...data }", () => {
    const q = { name: "posts-query" };
    const { result } = renderHook(() => useFirestoreQuery(() => q, []));

    expect(result.current.loading).toBe(true);
    expect(listeners[0].q).toBe(q);

    act(() => {
      listeners[0].onNext(
        makeSnapshot([
          { id: "a", data: { title: "First" } },
          { id: "b", data: { title: "Second" } },
        ])
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([
      { id: "a", title: "First" },
      { id: "b", title: "Second" },
    ]);
  });

  it("unsubscribes when the component unmounts", () => {
    const { unmount } = renderHook(() => useFirestoreQuery(() => ({}), []));
    expect(unsubscribes[0]).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribes[0]).toHaveBeenCalledTimes(1);
  });

  it("re-subscribes and drops the old listener when deps change", () => {
    const { rerender } = renderHook(
      ({ slug }) => useFirestoreQuery(() => ({ slug }), [slug]),
      { initialProps: { slug: "one" } }
    );

    rerender({ slug: "two" });

    expect(unsubscribes[0]).toHaveBeenCalledTimes(1);
    expect(listeners).toHaveLength(2);
    expect(listeners[1].q).toEqual({ slug: "two" });
  });

  it("does not re-subscribe when deps are unchanged", () => {
    const { rerender } = renderHook(() => useFirestoreQuery(() => ({}), []));

    rerender();

    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });

  it("stops loading and exposes the error when the query fails", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    onSnapshot.mockImplementation((q, onNext, onError) => {
      listeners.push({ q, onNext, onError });
      return vi.fn();
    });
    const { result } = renderHook(() => useFirestoreQuery(() => ({}), []));
    const error = new Error("The query requires an index");

    act(() => listeners[0].onError(error));

    expect(result.current).toEqual({ data: [], loading: false, error });
    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });

  it("does not subscribe when the builder returns null", () => {
    const { result } = renderHook(() => useFirestoreQuery(() => null, []));

    expect(onSnapshot).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: [], loading: false });
  });
});
