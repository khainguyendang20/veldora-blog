import { doc, getDoc, writeBatch } from "firebase/firestore";
import { createUserProfile, ensureUserProfile } from "module/auth/userProfile";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  writeBatch: vi.fn(),
}));

describe("userProfile", () => {
  let batch;

  beforeEach(() => {
    doc.mockImplementation((db, ...path) => path.join("/"));
    batch = { set: vi.fn(), commit: vi.fn().mockResolvedValue() };
    writeBatch.mockReturnValue(batch);
  });

  const written = () => Object.fromEntries(batch.set.mock.calls);

  it("keeps the email out of the public profile", async () => {
    await createUserProfile(
      { uid: "abcdefghij-rest", email: "a@b.co" },
      { fullname: "Alice Nguyen" }
    );

    const profile = written()["users/abcdefghij-rest"];
    expect(profile).toMatchObject({
      fullname: "Alice Nguyen",
      username: "alice-nguyen-abcdefghij",
      role: 3,
      status: 1,
    });
    expect(profile).not.toHaveProperty("email");
    expect(written()["userEmails/abcdefghij-rest"]).toEqual({ email: "a@b.co" });
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it("falls back to the account's display name, then the email", async () => {
    await createUserProfile({ uid: "u1", email: "bob@x.io", displayName: "Bob" });
    expect(written()["users/u1"].fullname).toBe("Bob");

    batch.set.mockClear();
    await createUserProfile({ uid: "u2", email: "carol@x.io" });
    expect(written()["users/u2"].fullname).toBe("carol");
  });

  it("creates a profile on first Google sign-in only", async () => {
    const user = { uid: "u1", email: "a@b.co", photoURL: "https://photo" };
    getDoc.mockResolvedValue({ exists: () => true });
    await ensureUserProfile(user);
    expect(batch.set).not.toHaveBeenCalled();

    getDoc.mockResolvedValue({ exists: () => false });
    await ensureUserProfile(user);
    expect(written()["users/u1"].avatar).toBe("https://photo");
  });
});
