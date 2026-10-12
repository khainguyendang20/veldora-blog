import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "utils/constants";
import Field from "components/field/Field";

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("Field", () => {
  it("should render children", () => {
    renderWithTheme(
      <Field>
        <span>Field content</span>
      </Field>
    );

    expect(screen.getByText("Field content")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    renderWithTheme(
      <Field>
        <label>Label</label>
        <input type="text" />
      </Field>
    );

    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
