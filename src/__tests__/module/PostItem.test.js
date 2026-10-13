import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "utils/constants";
import PostItem from "module/post/PostItem";
import PostItemMini from "module/post/PostItemMini";
import PostItemLarge from "module/post/PostItemLarge";
import PostThumbnail from "module/post/components/PostThumbnail";

const renderItem = (ui) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </MemoryRouter>
  );

const post = {
  title: "Hello",
  slug: "hello",
  desc: "A short summary",
  thumbnail: "",
  createdAt: { seconds: 1704067200 },
  categories: [{ id: "c1", name: "Tech", slug: "tech" }],
  user: { fullname: "Author", username: "author" },
};

describe.each([
  ["PostItem", PostItem],
  ["PostItemMini", PostItemMini],
  ["PostItemLarge", PostItemLarge],
])("%s", (name, Item) => {
  it("renders the title and category", () => {
    renderItem(<Item data={post} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
  });

  it("renders a post saved without categories", () => {
    renderItem(<Item data={{ ...post, categories: [] }} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders a fresh post whose timestamp is still pending", () => {
    renderItem(<Item data={{ ...post, createdAt: null }} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

describe("PostItem description", () => {
  it("shows the post's own description", () => {
    renderItem(<PostItem data={post} />);

    expect(screen.getByText("A short summary")).toBeInTheDocument();
    expect(screen.queryByText(/lorem ipsum/i)).not.toBeInTheDocument();
  });
});

describe("PostThumbnail", () => {
  it("links to the post when given a slug", () => {
    renderItem(<PostThumbnail url="" href="hello" />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/post/hello");
  });

  it("is a plain image without a slug, e.g. on the post page", () => {
    renderItem(<PostThumbnail url="" className="post-feature" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
