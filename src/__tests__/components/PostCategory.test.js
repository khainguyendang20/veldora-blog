import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter } from "react-router-dom";
import { theme } from "utils/constants";
import PostCategory from "module/post/components/PostCategory";

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );

describe("PostCategory", () => {
  it("should render category text", () => {
    renderWithProviders(<PostCategory>Active</PostCategory>);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render as a link", () => {
    renderWithProviders(<PostCategory href="/category/1">Business</PostCategory>);

    const link = screen.getByRole("link", { name: "Business" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/category/1");
  });

  it("should render link when href is not provided", () => {
    renderWithProviders(<PostCategory>Gaming</PostCategory>);

    const link = screen.getByRole("link", { name: "Gaming" });
    expect(link).toBeInTheDocument();
  });

  it("should render different category names", () => {
    const { rerender } = renderWithProviders(
      <PostCategory>Study</PostCategory>
    );
    expect(screen.getByText("Study")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <PostCategory>Gaming</PostCategory>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Gaming")).toBeInTheDocument();
  });
});
