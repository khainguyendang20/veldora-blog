import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import "jest-styled-components";
import { theme } from "utils/constants";
import LoadingSpinner from "components/loading/LoadingSpinner";

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("LoadingSpinner", () => {
  it("should render without crashing", () => {
    renderWithTheme(<LoadingSpinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("should use default size of 32px", () => {
    renderWithTheme(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyleRule("width", "32px");
    expect(spinner).toHaveStyleRule("height", "32px");
  });

  it("should accept custom size", () => {
    renderWithTheme(<LoadingSpinner size="20px" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyleRule("width", "20px");
    expect(spinner).toHaveStyleRule("height", "20px");
  });

  it("should accept custom borderSize", () => {
    renderWithTheme(<LoadingSpinner borderSize="2px" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyleRule("border-width", "2px");
  });
});
