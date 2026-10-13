import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import CategoryManagePage from "pages/manage/CategoryManagePage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

const makeSnapshot = (items) => {
  const docs = items.map((item) => ({
    id: item.id,
    data: () => ({ name: item.name, slug: item.id, status: 1 }),
  }));
  return { docs, size: docs.length, forEach: (cb) => docs.forEach(cb) };
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <CategoryManagePage />
    </MemoryRouter>
  );

describe("CategoryManagePage", () => {
  let listeners;

  beforeEach(() => {
    collection.mockReturnValue({ name: "categories" });
    query.mockReturnValue({ name: "first-page" });
    getDocs.mockResolvedValue(makeSnapshot([]));
    listeners = [];
    onSnapshot.mockImplementation((q, cb) => {
      const unsubscribe = vi.fn();
      listeners.push({ q, emit: (s) => act(() => cb(s)), unsubscribe });
      return unsubscribe;
    });
  });

  it("unsubscribes every listener on unmount", () => {
    const { unmount } = renderPage();
    expect(listeners.length).toBeGreaterThan(0);

    unmount();

    listeners.forEach(({ unsubscribe }) =>
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    );
  });

  it("appends the next page on load more without opening new listeners", async () => {
    renderPage();
    const total = listeners.find(({ q }) => q.name === "categories");
    const firstPage = listeners.find(({ q }) => q.name === "first-page");
    total.emit(makeSnapshot([{ id: "c1" }, { id: "c2" }, { id: "c3" }]));
    firstPage.emit(makeSnapshot([{ id: "c1", name: "First" }]));
    const listenerCount = onSnapshot.mock.calls.length;
    getDocs.mockResolvedValue(makeSnapshot([{ id: "c2", name: "Second" }]));

    fireEvent.click(screen.getByText("Load more"));

    expect(await screen.findByText("Second")).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(onSnapshot).toHaveBeenCalledTimes(listenerCount);
  });

  it("searches every category by name or slug, ignoring case", async () => {
    renderPage();
    const all = listeners.find(({ q }) => q.name === "categories");
    const firstPage = listeners.find(({ q }) => q.name === "first-page");
    all.emit(
      makeSnapshot([
        { id: "tech", name: "Technology" },
        { id: "life", name: "Lifestyle" },
      ])
    );
    firstPage.emit(makeSnapshot([{ id: "tech", name: "Technology" }]));

    fireEvent.change(screen.getByPlaceholderText("Type to search..."), {
      target: { value: "LIFE" },
    });

    // Found although it is not on the loaded page
    expect(await screen.findByText("Lifestyle")).toBeInTheDocument();
    expect(screen.queryByText("Technology")).not.toBeInTheDocument();
    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
  });
});
