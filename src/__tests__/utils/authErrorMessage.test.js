import { authErrorMessage } from "utils/authErrorMessage";

describe("authErrorMessage", () => {
  it("does not reveal whether the email or the password was wrong", () => {
    expect(authErrorMessage({ code: "auth/user-not-found" })).toBe(
      authErrorMessage({ code: "auth/wrong-password" })
    );
    expect(authErrorMessage({ code: "auth/invalid-credential" })).toBe(
      "Incorrect email or password."
    );
  });

  it("explains a duplicate registration", () => {
    expect(authErrorMessage({ code: "auth/email-already-in-use" })).toBe(
      "An account with this email already exists."
    );
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(authErrorMessage(new Error("boom"))).toBe(
      "Something went wrong, please try again!"
    );
    expect(authErrorMessage(undefined)).toBe(
      "Something went wrong, please try again!"
    );
  });
});
