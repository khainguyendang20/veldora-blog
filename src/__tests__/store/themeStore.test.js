import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useAuthStore, useThemeStore } from "store";
import Header from "components/layout/Header";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({ getAuth: vi.fn(), signOut: vi.fn() }));
vi.mock("@uidotdev/usehooks", () => ({ useMediaQuery: vi.fn() }));

describe("dark mode", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthLoading: false });
    useThemeStore.setState({ mode: "light" });
    document.documentElement.dataset.theme = "light";
    useMediaQuery.mockReturnValue(true);
  });

  it("switches modes from the header and remembers the choice", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
  });
});
