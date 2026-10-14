import React from "react";
import styled from "styled-components";

// Short posts don't need one
const minHeadings = 3;

const TableOfContentsStyles = styled.nav`
  margin-bottom: 32px;
  padding: 16px 20px;
  border-radius: 12px;
  background: ${(props) => props.theme.gray1};
  .toc__title {
    font-weight: 600;
    margin-bottom: 8px;
  }
  li {
    padding: 4px 0;
    line-height: 1.4;
  }
  .toc__level-2 {
    padding-left: 16px;
  }
  .toc__level-3 {
    padding-left: 32px;
  }
  a:hover {
    color: ${(props) => props.theme.primary};
  }
`;

const TableOfContents = ({ headings }) => {
  if (headings.length < minHeadings) return null;
  // Indent relative to the post's top heading level
  const top = Math.min(...headings.map((heading) => heading.level));
  return (
    <TableOfContentsStyles aria-label="Table of contents">
      <p className="toc__title">Contents</p>
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
