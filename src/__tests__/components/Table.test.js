import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "utils/constants";
import Table from "components/table/Table";

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("Table", () => {
  it("should render a table element", () => {
    renderWithTheme(
      <Table>
        <thead>
          <tr>
            <th>Header</th>
          </tr>
        </thead>
      </Table>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("should render table with header and body", () => {
    renderWithTheme(
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John</td>
            <td>john@test.com</td>
          </tr>
        </tbody>
      </Table>
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("should render column headers", () => {
    renderWithTheme(
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
      </Table>
    );

    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });
});
