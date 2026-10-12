import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import Header from "components/layout/Header";
import DashboardSidebar from "module/dashboard/DashboardSidebar";

jest.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
jest.mock("firebase/auth", () => ({ getAuth: jest.fn(), signOut: jest.fn() }));
jest.mock("@uidotdev/usehooks", () => ({ useMediaQuery: jest.fn() }));

const renderWithRouter = (ui) => {
  const utils = render(<MemoryRouter>{ui}</MemoryRouter>);
  return {
    ...utils,
    rerender: (next) => utils.rerender(<MemoryRouter>{next}</MemoryRouter>),
  };
};

describe("Header", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthLoading: false });
  });

  it("shows the inline menu on desktop", () => {
    useMediaQuery.mockReturnValue(true);
    renderWithRouter(<Header />);

    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("collapses the menu on smaller screens", () => {
    useMediaQuery.mockReturnValue(false);
    renderWithRouter(<Header />);

    expect(screen.queryByText("Blog")).not.toBeInTheDocument();
  });

  it("keeps menu items mounted across re-renders", () => {
    useMediaQuery.mockReturnValue(true);
    const { rerender } = renderWithRouter(<Header />);
    const before = screen.getByRole("link", { name: "Blog" });

    rerender(<Header />);

    expect(screen.getByRole("link", { name: "Blog" })).toBe(before);
  });
});

describe("DashboardSidebar", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { uid: "u1", role: userRole.ADMIN },
      isAuthLoading: false,
    });
  });

  it("keeps links mounted across re-renders", () => {
    const { rerender } = renderWithRouter(<DashboardSidebar />);
    const before = screen.getByRole("link", { name: "Post" });

    rerender(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: "Post" })).toBe(before);
  });

  it("styles the logout item like the other links", () => {
    renderWithRouter(<DashboardSidebar />);

    expect(screen.getByRole("button", { name: "Logout" })).toHaveClass(
      "sidebar__link"
    );
  });
});
