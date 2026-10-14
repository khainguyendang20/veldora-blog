import React from "react";
import styled from "styled-components";

// Card around an admin form. .field-format lays fields out in two
// columns, one on small screens; .form-actions holds the submit buttons.
const FormContainerStyles = styled.div`
  padding: 28px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  .field-format {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 24px;
    width: 100%;
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
  }
  @media only screen and (max-width: 768px) {
    padding: 20px 16px;
    .field-format {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

const FormContainer = ({ children }) => {
  return <FormContainerStyles>{children}</FormContainerStyles>;
};

export default FormContainer;
