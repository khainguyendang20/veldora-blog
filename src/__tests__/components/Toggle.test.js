import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "utils/constants";
import Toggle from "components/checkbox/Toggle";

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("Toggle", () => {
  it("should render checkbox input", () => {
    renderWithTheme(<Toggle on={false} onClick={() => {}} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should render as unchecked when on is false", () => {
    renderWithTheme(<Toggle on={false} onClick={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(false);
  });

  it("should render as checked when on is true", () => {
    renderWithTheme(<Toggle on={true} onClick={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  it("should call onClick when clicked", () => {
    const handleClick = jest.fn();
    renderWithTheme(<Toggle on={false} onClick={handleClick} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
