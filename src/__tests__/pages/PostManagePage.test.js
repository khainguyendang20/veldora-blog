import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import PostManagePage from "pages/manage/PostManagePage";

jest.mock("config/firebase-config", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

const renderAs = (user) => {
  useAuthStore.setState({ user, isAuthLoading: false });
  return render(
    <MemoryRouter>
      <PostManagePage />
    </MemoryRouter>
  );
};

describe("PostManagePage", () => {
  beforeEach(() => {
    collection.mockReturnValue({ name: "posts" });
    query.mockReturnValue({ name: "own-posts" });
    where.mockReturnValue("user.id == u2");
    onSnapshot.mockReturnValue(jest.fn());
  });

  it("lists every post for moderators", () => {
    renderAs({ uid: "u1", role: userRole.MOD });

    expect(onSnapshot.mock.calls[0][0]).toEqual({ name: "posts" });
  });

  it("lists only their own posts for regular users", () => {
    renderAs({ uid: "u2", role: userRole.USER });

    expect(where).toHaveBeenCalledWith("user.id", "==", "u2");
    expect(onSnapshot.mock.calls[0][0]).toEqual({ name: "own-posts" });
  });

  it("keeps one subscription when unrelated profile fields change", () => {
    renderAs({ uid: "u2", role: userRole.USER, fullname: "A" });

    act(() =>
      useAuthStore.setState({
        user: { uid: "u2", role: userRole.USER, fullname: "B" },
      })
    );

    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });
});
