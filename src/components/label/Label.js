import React from "react";
import styled from "styled-components";

const LabelStyles = styled.label`
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const Label = ({ htmlFor, children, ...props }) => {
  return (
    <LabelStyles htmlFor={htmlFor} {...props}>
      {children}
    </LabelStyles>
  );
};

export default Label;
