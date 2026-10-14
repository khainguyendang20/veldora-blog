import React from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
`;

const SkeletonStyles = styled.span`
  display: block;
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  border-radius: ${(props) => props.$radius};
  background: linear-gradient(
    90deg,
    var(--color-subtle) 25%,
    var(--color-border) 50%,
    var(--color-subtle) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// A grey placeholder block shaped like the content that is loading
const Skeleton = ({
  width = "100%",
  height = "16px",
  radius = "6px",
  style,
}) => (
  <SkeletonStyles
    aria-hidden="true"
    $width={width}
    $height={height}
    $radius={radius}
    style={style}
  ></SkeletonStyles>
);

// Wraps a group of skeletons so assistive tech hears one "Loading" instead
// of a pile of empty blocks
export const SkeletonGroup = ({ children, className, label = "Loading" }) => (
  <div role="status" aria-label={label} aria-busy="true" className={className}>
    {children}
  </div>
);

export default Skeleton;
