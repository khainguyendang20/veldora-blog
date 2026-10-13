import React from "react";
import styled from "styled-components";

const LoadingStyles = styled.span`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  border-width: ${(props) => props.borderSize};
  border-style: solid;
  border-color: ${(props) => props.color};
  border-top-color: transparent;
  animation: spinner linear 0.75s infinite;
  border-radius: 100rem;
  display: inline-block;
  @keyframes spinner {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner = ({ size = "32px", borderSize = "4px", color = "white" }) => {
  return (
    <LoadingStyles
      role="status"
      aria-label="Loading"
      size={size}
      borderSize={borderSize}
      color={color}
    ></LoadingStyles>
  );
};

export default LoadingSpinner;
