import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import Header from "components/layout/Header";
import DashboardSidebar from "module/dashboard/DashboardSidebar";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({ getAuth: vi.fn(), signOut: vi.fn() }));
vi.mock("@uidotdev/usehooks", () => ({ useMediaQuery: vi.fn() }));

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

  it("does not link to pages that don't exist", () => {
    useMediaQuery.mockReturnValue(true);
    renderWithRouter(<Header />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.queryByText("Contact")).not.toBeInTheDocument();
  });

  it("opens the search page with the typed query", () => {
    useMediaQuery.mockReturnValue(true);
    const Location = () => <p>at {useLocation().pathname + useLocation().search}</p>;
    render(
      <MemoryRouter>
        <Header />
        <Routes>
          <Route path="*" element={<Location />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search posts" }), {
      target: { value: " da lat " },
    });
    fireEvent.submit(screen.getByRole("search"));

    expect(screen.getByText("at /search?q=da%20lat")).toBeInTheDocument();
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
