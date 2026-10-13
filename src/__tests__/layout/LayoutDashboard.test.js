import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuthStore } from "store";
import LayoutDashboard from "layout/LayoutDashboard";

// Header and sidebar pull in Firebase; they are not under test here.
vi.mock("components/layout/Header", () => ({ default: () => null }));
vi.mock("module/dashboard/DashboardSidebar", () => ({ default: () => null }));

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={["/manage/post"]}>
      <Routes>
        <Route element={<LayoutDashboard />}>
          <Route path="/manage/post" element={<p>Post manager</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>
  );

describe("LayoutDashboard", () => {
  it("does not redirect while the auth session is still loading", () => {
    useAuthStore.setState({ user: null, isAuthLoading: true });
    renderDashboard();

    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
    expect(screen.queryByText("Post manager")).not.toBeInTheDocument();
  });

  it("redirects to login once auth resolves with no user", () => {
    useAuthStore.setState({ user: null, isAuthLoading: false });
    renderDashboard();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders the page for a signed-in user", () => {
    useAuthStore.setState({
      user: { uid: "1", email: "a@b.c" },
      isAuthLoading: false,
    });
    renderDashboard();

    expect(screen.getByText("Post manager")).toBeInTheDocument();
  });
});
