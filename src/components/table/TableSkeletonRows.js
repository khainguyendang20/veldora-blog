import { Skeleton } from "components/skeleton";
import React from "react";

// Placeholder rows for a table whose data is loading, so it doesn't flash
// its empty state first
const TableSkeletonRows = ({ columns, rows = 5 }) => (
  <>
    {Array.from({ length: rows }, (_, row) => (
      <tr
        key={row}
        role="status"
        aria-label={row === 0 ? "Loading" : undefined}
      >
        {Array.from({ length: columns }, (_, col) => (
          <td key={col}>
            <Skeleton width={col === 0 ? "80%" : "60%"} height="14px" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default TableSkeletonRows;
