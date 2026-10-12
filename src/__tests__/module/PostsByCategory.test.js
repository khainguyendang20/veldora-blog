import React from "react";
import { render } from "@testing-library/react";
import { onSnapshot, query, where } from "firebase/firestore";
import PostsByCategory from "module/home/PostsByCategory";

jest.mock("config/firebase-config", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

describe("PostsByCategory", () => {
  beforeEach(() => {
    query.mockReturnValue({ name: "category-posts" });
    onSnapshot.mockReturnValue(jest.fn());
  });

  it("queries approved posts by the given category id", () => {
    render(<PostsByCategory categoryId="cat-123" />);

    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(where).toHaveBeenCalledWith(
      "categoryIds",
      "array-contains",
      "cat-123"
    );
  });
});
