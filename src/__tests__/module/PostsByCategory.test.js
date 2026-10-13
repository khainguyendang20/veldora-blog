import React from "react";
import { render } from "@testing-library/react";
import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import PostsByCategory from "module/home/PostsByCategory";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}));

describe("PostsByCategory", () => {
  beforeEach(() => {
    query.mockReturnValue({ name: "category-posts" });
    onSnapshot.mockReturnValue(vi.fn());
  });

  it("queries approved posts by the given category id", () => {
    render(<PostsByCategory categoryId="cat-123" />);

    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(where).toHaveBeenCalledWith(
      "categoryIds",
      "array-contains",
      "cat-123"
    );
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
  });
});
