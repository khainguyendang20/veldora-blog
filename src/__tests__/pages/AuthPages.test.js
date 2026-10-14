import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import {
  createUserProfile,
  ensureUserProfile,
} from "module/auth/userProfile";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import LoginPage from "pages/LoginPage";
import RegisterPage from "pages/RegisterPage";
import ForgotPasswordPage from "pages/ForgotPasswordPage";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));
vi.mock("module/auth/userProfile", () => ({
  createUserProfile: vi.fn(),
  ensureUserProfile: vi.fn(),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderPage = (ui) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), {
    target: { value },
  });

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthLoading: false });
  getRedirectResult.mockResolvedValue(null);
});

describe("LoginPage", () => {
  it("labels the submit button Sign in", () => {
    renderPage(<LoginPage />);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows a friendly message for wrong credentials", async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
      message: "Firebase: Error (auth/invalid-credential).",
    });
    renderPage(<LoginPage />);

    type("Email", "a@b.co");
    type("Password", "secret123");
    // Submitting right after typing used to be ignored by a stale isValid
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Incorrect email or password.")
    );
  });
});

describe("RegisterPage", () => {
  const fillForm = () => {
    type("Full name", "Alice");
    type("Email", "a@b.co");
    type("Password", "secret123");
  };

  it("reports an email that is already registered", async () => {
    createUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/email-already-in-use",
    });
    renderPage(<RegisterPage />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "An account with this email already exists."
      )
    );
    expect(createUserProfile).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});

describe("RegisterPage success", () => {
  it("creates the profile with the chosen name", async () => {
    const user = { uid: "u1", email: "a@b.co" };
    createUserWithEmailAndPassword.mockResolvedValue({ user });
    createUserProfile.mockResolvedValue();
    renderPage(<RegisterPage />);

    type("Full name", "Alice");
    type("Email", "a@b.co");
    type("Password", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(createUserProfile).toHaveBeenCalledWith(user, { fullname: "Alice" })
    );
    expect(toast.success).toHaveBeenCalled();
  });
});

describe("ForgotPasswordPage", () => {
  const requestReset = () => {
    renderPage(<ForgotPasswordPage />);
    type("Email", "a@b.co");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
  };

  it("sends a reset link", async () => {
    sendPasswordResetEmail.mockResolvedValue();
    requestReset();

    expect(await screen.findByText(/a link to reset its password/)).toBeInTheDocument();
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, "a@b.co");
  });

  it("does not reveal whether the email has an account", async () => {
    sendPasswordResetEmail.mockRejectedValue({ code: "auth/user-not-found" });
    requestReset();

    expect(await screen.findByText(/a link to reset its password/)).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("reports other failures", async () => {
    sendPasswordResetEmail.mockRejectedValue({ code: "auth/too-many-requests" });
    requestReset();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Too many attempts. Please wait a moment and try again."
      )
    );
  });
});

describe("Google sign-in", () => {
  const clickGoogle = () => {
    renderPage(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  };

  it("creates the profile on first sign-in", async () => {
    const user = { uid: "g1", email: "a@gmail.com" };
    signInWithPopup.mockResolvedValue({ user });
    ensureUserProfile.mockResolvedValue();
    clickGoogle();

    await waitFor(() => expect(ensureUserProfile).toHaveBeenCalledWith(user));
  });

  it("stays quiet when the reader closes the popup", async () => {
    signInWithPopup.mockRejectedValue({ code: "auth/popup-closed-by-user" });
    clickGoogle();

    await waitFor(() => expect(signInWithPopup).toHaveBeenCalled());
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("falls back to a redirect when the browser blocks the popup", async () => {
    signInWithPopup.mockRejectedValue({ code: "auth/popup-blocked" });
    clickGoogle();

    await waitFor(() => expect(signInWithRedirect).toHaveBeenCalledTimes(1));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("finishes a redirect sign-in when Google sends the reader back", async () => {
    const user = { uid: "g1", email: "a@gmail.com" };
    getRedirectResult.mockResolvedValue({ user });
    ensureUserProfile.mockResolvedValue();
    renderPage(<LoginPage />);

    await waitFor(() => expect(ensureUserProfile).toHaveBeenCalledWith(user));
  });

  it("explains when Google sign-in is not enabled", async () => {
    signInWithPopup.mockRejectedValue({ code: "auth/operation-not-allowed" });
    clickGoogle();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("This sign-in method is not enabled yet.")
    );
  });
});

describe("LoginPage links", () => {
  it("links to the password reset page", () => {
    renderPage(<LoginPage />);

    expect(
      screen.getByRole("link", { name: "Forgot password?" })
    ).toHaveAttribute("href", "/forgot-password");
  });
});

describe("auth form fields", () => {
  it("lets password managers fill a saved password on sign in", () => {
    renderPage(<LoginPage />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
  });

  it("asks password managers for a new password on sign up", () => {
    renderPage(<RegisterPage />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password"
    );
    expect(screen.getByLabelText("Full name")).toHaveAttribute("autocomplete", "name");
  });

  it("shows and hides the password", () => {
    renderPage(<LoginPage />);
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("ties a validation error to its field", async () => {
    renderPage(<LoginPage />);

    type("Email", "not-an-email");

    const email = screen.getByLabelText("Email");
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveAccessibleDescription("Enter a valid email address");
  });

  it("lets the reader try another address after requesting a reset", async () => {
    sendPasswordResetEmail.mockResolvedValue();
    renderPage(<ForgotPasswordPage />);
    type("Email", "a@b.co");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    await screen.findByRole("heading", { name: "Check your email" });

    fireEvent.click(screen.getByRole("button", { name: "Try another email" }));

    expect(screen.getByRole("heading", { name: "Reset your password" })).toBeInTheDocument();
  });
});
