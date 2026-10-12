import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import "jest-styled-components";
import { theme } from "utils/constants";
import LoadingSpinner from "components/loading/LoadingSpinner";

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("LoadingSpinner", () => {
  it("should render without crashing", () => {
    const { container } = renderWithTheme(<LoadingSpinner />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("should use default size of 32px", () => {
    const { container } = renderWithTheme(<LoadingSpinner />);
    const spinner = container.querySelector("span");
    expect(spinner).toHaveStyleRule("width", "32px");
    expect(spinner).toHaveStyleRule("height", "32px");
  });

  it("should accept custom size", () => {
    const { container } = renderWithTheme(<LoadingSpinner size="20px" />);
    const spinner = container.querySelector("span");
    expect(spinner).toHaveStyleRule("width", "20px");
    expect(spinner).toHaveStyleRule("height", "20px");
  });

  it("should accept custom borderSize", () => {
    const { container } = renderWithTheme(
      <LoadingSpinner borderSize="2px" />
    );
    const spinner = container.querySelector("span");
    expect(spinner).toHaveStyleRule("border-width", "2px");
  });
});
