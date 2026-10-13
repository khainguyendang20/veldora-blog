import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import LoginPage from "pages/LoginPage";
import RegisterPage from "pages/RegisterPage";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
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
    expect(setDoc).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
