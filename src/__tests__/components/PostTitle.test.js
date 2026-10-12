import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter } from "react-router-dom";
import { theme } from "utils/constants";
import PostTitle from "module/post/components/PostTitle";

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );

describe("PostTitle", () => {
  it("should render the title text", () => {
    renderWithProviders(<PostTitle>Hello World</PostTitle>);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should render as a link to the post", () => {
    renderWithProviders(
      <PostTitle href="hello-world">Hello World</PostTitle>
    );

    const link = screen.getByRole("link", { name: "Hello World" });
    expect(link).toHaveAttribute("href", "/post/hello-world");
  });

  it("should render link when href is not provided", () => {
    renderWithProviders(<PostTitle>Test Title</PostTitle>);

    const link = screen.getByRole("link", { name: "Test Title" });
    expect(link).toBeInTheDocument();
  });

  it("should have post-title class", () => {
    renderWithProviders(<PostTitle>My Post</PostTitle>);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveClass("post-title");
  });
});
