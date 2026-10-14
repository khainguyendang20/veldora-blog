import React from "react";
import styled from "styled-components";

const PageHeaderStyles = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  .page-header__title {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.25;
  }
  .page-header__description {
    margin-top: 4px;
    color: var(--color-muted);
    font-size: 14px;
  }
  .page-header__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }
  /* Narrow screens: actions take their own full-width row */
  @media only screen and (max-width: 640px) {
    .page-header__actions {
      width: 100%;
    }
    .page-header__actions > label {
      flex: 1 1 160px;
      width: auto;
    }
  }
`;

// Title, optional one-line description and actions (search, buttons) at
// the top of every admin page
const PageHeader = ({ title, description, children }) => {
  return (
    <PageHeaderStyles>
      <div>
        <h1 className="page-header__title">{title}</h1>
        {description && (
          <p className="page-header__description">{description}</p>
        )}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
    </PageHeaderStyles>
  );
};

export default PageHeader;
