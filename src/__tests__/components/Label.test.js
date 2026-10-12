import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "utils/constants";
import Label from "components/label/Label";

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("Label", () => {
  it("should render label with children text", () => {
    renderWithTheme(<Label htmlFor="email">Email</Label>);

    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should have correct htmlFor attribute", () => {
    renderWithTheme(<Label htmlFor="username">Username</Label>);

    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for", "username");
  });

  it("should pass additional props", () => {
    renderWithTheme(
      <Label htmlFor="test" data-testid="test-label">
        Test
      </Label>
    );

    expect(screen.getByTestId("test-label")).toBeInTheDocument();
  });
});
