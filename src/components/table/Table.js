import React from "react";
import styled from "styled-components";

const TableStyles = styled.div`
  overflow-x: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  table {
    width: 100%;
    border-collapse: collapse;
  }
  thead {
    background-color: var(--color-subtle);
  }
  th,
  td {
    vertical-align: middle;
    padding: 12px 16px;
    text-align: left;
  }
  th {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-muted);
    white-space: nowrap;
  }
  td {
    border-top: 1px solid var(--color-border);
    font-size: 14px;
  }
  tbody tr {
    transition: background 0.15s;
  }
  tbody tr:hover {
    background: var(--color-subtle);
  }
  .table-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
  .table-empty {
    padding: 40px 16px;
    text-align: center;
    color: var(--color-muted);
  }
`;

const Table = ({ children }) => {
  return (
    <TableStyles>
      <table>{children}</table>
    </TableStyles>
  );
};

export default Table;
