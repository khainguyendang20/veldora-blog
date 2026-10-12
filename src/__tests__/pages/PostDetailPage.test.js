import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getDoc, onSnapshot, query } from "firebase/firestore";
import PostDetailPage from "pages/PostDetailPage";

jest.mock("config/firebase-config", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));

const post = {
  title: "Hello",
  slug: "hello",
  thumbnail: "",
  createdAt: { seconds: 1700000000 },
  user: { id: "u1", fullname: "Author", username: "author" },
  content:
    '<p>Safe text</p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/post/:slug" element={<PostDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("PostDetailPage", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    query.mockReturnValue({ name: "post-by-slug" });
    getDoc.mockResolvedValue({ data: () => undefined });
  });

  it("strips scripts and event handlers from post content", () => {
    let onNext;
    onSnapshot.mockImplementation((q, cb) => {
      onNext = cb;
      return jest.fn();
    });
    const { container } = renderAt("/post/hello");

    act(() =>
      onNext({ forEach: (cb) => cb({ id: "p1", data: () => post }) })
    );

    const content = container.querySelector(".entry-content");
    expect(content.textContent).toContain("Safe text");
    expect(content.querySelector("img").getAttribute("onerror")).toBeNull();
    expect(content.querySelector("script")).toBeNull();
  });

  it("unsubscribes from the post on unmount", () => {
    const unsubscribe = jest.fn();
    onSnapshot.mockReturnValue(unsubscribe);
    const { unmount } = renderAt("/post/hello");

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
