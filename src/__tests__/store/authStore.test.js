import { useAuthStore } from "store";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({ user: null });
  });

  it("should have initial user as null", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it("should set current user", () => {
    const mockUser = {
      uid: "123",
      email: "test@example.com",
      fullname: "Test User",
      role: 3,
      status: 1,
    };

    useAuthStore.getState().setCurrentUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it("should update user when called multiple times", () => {
    const user1 = { uid: "1", email: "user1@test.com" };
    const user2 = { uid: "2", email: "user2@test.com" };

    useAuthStore.getState().setCurrentUser(user1);
    expect(useAuthStore.getState().user).toEqual(user1);

    useAuthStore.getState().setCurrentUser(user2);
    expect(useAuthStore.getState().user).toEqual(user2);
  });

  it("starts in the auth-loading state", async () => {
    vi.resetModules();
    const { useAuthStore: freshStore } = await import("store");
    expect(freshStore.getState().isAuthLoading).toBe(true);
  });

  it("leaves the auth-loading state once a user (or null) is resolved", () => {
    useAuthStore.setState({ isAuthLoading: true });
    useAuthStore.getState().setCurrentUser(null);
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
  });

  it("should set user back to null (logout)", () => {
    const mockUser = { uid: "123", email: "test@example.com" };

    useAuthStore.getState().setCurrentUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    useAuthStore.getState().setCurrentUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
