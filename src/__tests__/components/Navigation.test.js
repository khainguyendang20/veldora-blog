import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { onSnapshot, query } from "firebase/firestore";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import Header from "components/layout/Header";
import DashboardSidebar from "module/dashboard/DashboardSidebar";

vi.mock("config/firebase-config", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({ getAuth: vi.fn(), signOut: vi.fn() }));
vi.mock("@uidotdev/usehooks", () => ({ useMediaQuery: vi.fn() }));
// Signed in, the header listens for unread notifications
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

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

  it("adds the Following feed to the menu once signed in", () => {
    useMediaQuery.mockReturnValue(true);
    const { rerender } = renderWithRouter(<Header />);
    expect(screen.queryByRole("link", { name: "Following" })).not.toBeInTheDocument();

    useAuthStore.setState({ user: { uid: "u1" }, isAuthLoading: false });
    rerender(<Header />);

    expect(screen.getByRole("link", { name: "Following" })).toHaveAttribute(
      "href",
      "/following"
    );
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
    const before = screen.getByRole("link", { name: "Posts" });

    rerender(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: "Posts" })).toBe(before);
  });

  it("styles the logout item like the other links", () => {
    renderWithRouter(<DashboardSidebar />);

    expect(screen.getByRole("button", { name: "Logout" })).toHaveClass(
      "sidebar__link"
    );
  });
});

describe("DashboardSidebar header duties", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { uid: "u1", role: userRole.MOD, fullname: "Lan Pham" },
      isAuthLoading: false,
    });
    query.mockReturnValue({});
    // Three unread notifications
    onSnapshot.mockImplementation((q, cb) => {
      cb({ forEach: (fn) => ["n1", "n2", "n3"].forEach((id) => fn({ id, data: () => ({}) })) });
      return vi.fn();
    });
  });

  it("links the logo back to the blog", () => {
    renderWithRouter(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: "Veldora Blog" })).toHaveAttribute("href", "/");
  });

  it("shows the unread count on Notifications", () => {
    renderWithRouter(<DashboardSidebar />);

    expect(
      screen.getByRole("link", { name: "Notifications (3 unread)" })
    ).toHaveAttribute("href", "/manage/notifications");
  });

  it("shows who is signed in, linking to their profile settings", () => {
    renderWithRouter(<DashboardSidebar />);

    const profile = screen.getByRole("link", { name: /Lan Pham/ });
    expect(profile).toHaveAttribute("href", "/manage/profile");
    expect(profile).toHaveTextContent("Moderator");
  });

  it("switches the color mode", () => {
    renderWithRouter(<DashboardSidebar />);

    expect(screen.getByRole("button", { name: /Switch to (dark|light) mode/ })).toBeInTheDocument();
  });
});
