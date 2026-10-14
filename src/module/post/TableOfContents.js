import React from "react";
import styled from "styled-components";

// Short posts don't need one
const minHeadings = 3;
export const hasTableOfContents = (headings) => headings.length >= minHeadings;

const TableOfContentsStyles = styled.nav`
  border-left: 2px solid var(--color-border);
  padding-left: 16px;
  font-size: 14px;
  .toc__title {
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  ol {
    list-style: none;
    padding: 0;
  }
  li {
    padding: 4px 0;
    line-height: 1.45;
  }
  .toc__level-2 {
    padding-left: 12px;
  }
  .toc__level-3 {
    padding-left: 24px;
  }
  a {
    color: var(--color-muted);
    transition: color 0.15s;
  }
  a:hover {
    color: ${(props) => props.theme.primary};
  }
`;

const TableOfContents = ({ headings }) => {
  if (!hasTableOfContents(headings)) return null;
  // Indent relative to the post's top heading level
  const top = Math.min(...headings.map((heading) => heading.level));
  return (
    <TableOfContentsStyles aria-label="Table of contents">
      <p className="toc__title">On this page</p>
      <ol>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`toc__level-${heading.level - top + 1}`}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </TableOfContentsStyles>
  );
};

export default TableOfContents;
