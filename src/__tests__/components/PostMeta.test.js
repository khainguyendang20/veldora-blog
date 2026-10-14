import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter } from "react-router-dom";
import { theme } from "utils/constants";
import PostMeta from "module/post/components/PostMeta";

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );

describe("PostMeta", () => {
  const mockAuth = {
    username: "john_doe",
    fullname: "John Doe",
    avatar: "https://example.com/avatar.jpg",
  };

  it("should render author name", () => {
    renderWithProviders(<PostMeta auth={mockAuth} date="Jan 1, 2024" />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render date", () => {
    renderWithProviders(<PostMeta auth={mockAuth} date="Jan 1, 2024" />);

    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
  });

  it("should hide the date when it is not known yet", () => {
    const { container } = renderWithProviders(<PostMeta auth={mockAuth} />);

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector(".post-date")).toBeNull();
  });

  it("should link to author profile", () => {
    renderWithProviders(<PostMeta auth={mockAuth} date="Jan 1, 2024" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile/john_doe");
  });

  it("should show default name when fullname is not provided", () => {
    renderWithProviders(
      <PostMeta auth={{ username: "test" }} date="Jan 1, 2024" />
    );

    expect(screen.getByText("Unknown author")).toBeInTheDocument();
  });

  it("should render author avatar", () => {
    renderWithProviders(<PostMeta auth={mockAuth} date="Jan 1, 2024" />);

    const avatar = screen.getByRole("img");
    expect(avatar).toHaveAttribute("src", mockAuth.avatar);
  });

  it("should render link when username is not provided", () => {
    renderWithProviders(<PostMeta auth={{}} date="Jan 1, 2024" />);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });
});

describe("PostMeta reading time", () => {
  it("shows how long the post takes to read", () => {
    renderWithProviders(
      <PostMeta auth={{ fullname: "A" }} date="Jan 1, 2024" minutesToRead={4} />
    );

    expect(screen.getByText("· 4 min read")).toBeInTheDocument();
  });
});

describe("PostMeta counters", () => {
  it("shows likes and comments when there are any", () => {
    renderWithProviders(
      <PostMeta auth={{ fullname: "A" }} likeCount={3} commentCount={0} />
    );

    expect(screen.getByLabelText("3 likes")).toBeInTheDocument();
    expect(screen.queryByLabelText(/comments/)).not.toBeInTheDocument();
  });
});
