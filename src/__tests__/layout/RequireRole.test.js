import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuthStore } from "store";
import { userRole } from "utils/constants";
import RequireRole from "layout/RequireRole";

const renderGuarded = (role) => {
  useAuthStore.setState({ user: { uid: "1", role }, isAuthLoading: false });
  return render(
    <MemoryRouter initialEntries={["/manage/category"]}>
      <Routes>
        <Route element={<RequireRole roles={[userRole.ADMIN, userRole.MOD]} />}>
          <Route path="/manage/category" element={<p>Category manager</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe("RequireRole", () => {
  it.each([
    ["admin", userRole.ADMIN],
    ["moderator", userRole.MOD],
  ])("renders the page for an allowed role (%s)", (_, role) => {
    renderGuarded(role);

    expect(screen.getByText("Category manager")).toBeInTheDocument();
  });

  it("shows access denied for a role outside the list", () => {
    renderGuarded(userRole.USER);

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Category manager")).not.toBeInTheDocument();
  });
});
