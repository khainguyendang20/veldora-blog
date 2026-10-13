import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
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

const type = (placeholder, value) =>
  fireEvent.change(screen.getByPlaceholderText(placeholder), {
    target: { value },
  });

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthLoading: false });
});

describe("LoginPage", () => {
  it("labels the submit button Sign In", () => {
    renderPage(<LoginPage />);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows a friendly message for wrong credentials", async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
      message: "Firebase: Error (auth/invalid-credential).",
    });
    renderPage(<LoginPage />);

    type("Enter your email address...", "a@b.co");
    type("Enter your password...", "secret123");
    // Submitting right after typing used to be ignored by a stale isValid
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Incorrect email or password.")
    );
  });
});

describe("RegisterPage", () => {
  const fillForm = () => {
    type("Enter your fullname...", "Alice");
    type("Enter your email address...", "a@b.co");
    type("Enter your password...", "secret123");
  };

  it("reports an email that is already registered", async () => {
    createUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/email-already-in-use",
    });
    renderPage(<RegisterPage />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

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

    type("Enter your fullname...", "Alice");
    type("Enter your email address...", "a@b.co");
    type("Enter your password...", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(createUserProfile).toHaveBeenCalledWith(user, { fullname: "Alice" })
    );
    expect(toast.success).toHaveBeenCalled();
  });
});

describe("ForgotPasswordPage", () => {
  const requestReset = () => {
    renderPage(<ForgotPasswordPage />);
    type("Enter your email address...", "a@b.co");
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
      screen.getByRole("link", { name: "Forgot your password?" })
    ).toHaveAttribute("href", "/forgot-password");
  });
});
