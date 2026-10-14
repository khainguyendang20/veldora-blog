import { act, renderHook } from "@testing-library/react";
import useAutosave from "hooks/useAutosave";

const initial = { title: "", content: "" };

describe("useAutosave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const stored = () => JSON.parse(localStorage.getItem("autosave:new"));

  it("saves changed values a second after the last change", () => {
    const { rerender } = renderHook(({ values }) => useAutosave("new", values, initial), {
      initialProps: { values: initial },
    });

    rerender({ values: { title: "Hello", content: "" } });
    act(() => vi.advanceTimersByTime(500));
    expect(stored()).toBeNull();

    act(() => vi.advanceTimersByTime(600));
    expect(stored().values).toEqual({ title: "Hello", content: "" });
  });

  it("offers a copy from an earlier visit that differs from the form", () => {
    localStorage.setItem(
      "autosave:new",
      JSON.stringify({ values: { title: "Unsaved", content: "" }, savedAt: 1 })
    );

    const { result } = renderHook(() => useAutosave("new", initial, initial));

    expect(result.current.saved.values.title).toBe("Unsaved");
  });

  it("does not offer a copy identical to what the form already shows", () => {
    localStorage.setItem("autosave:p1", JSON.stringify({ values: { title: "Same" } }));

    const { result } = renderHook(() =>
      useAutosave("p1", { title: "Same" }, { title: "Same" })
    );

    expect(result.current.saved).toBeNull();
  });

  it("forgets the copy once the form is submitted", () => {
    const { result, rerender } = renderHook(
      ({ values }) => useAutosave("new", values, initial),
      { initialProps: { values: { title: "Hello", content: "" } } }
    );
    act(() => vi.advanceTimersByTime(1100));

    act(() => result.current.clear());
    rerender({ values: { title: "Hello", content: "" } });

    expect(stored()).toBeNull();
  });
});
