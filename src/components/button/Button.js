import { LoadingSpinner } from "components/loading";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

const sizes = {
  // The large call-to-action used on public pages
  lg: css`
    height: 60px;
    min-width: 240px;
    padding: 0 20px;
    font-size: 18px;
    margin: 0 auto;
  `,
  // Compact, for admin pages and toolbars
  md: css`
    height: 40px;
    padding: 0 18px;
    font-size: 15px;
  `,
};

const variants = {
  primary: css`
    background-image: linear-gradient(
      to right bottom,
      ${(props) => props.theme.primary},
      ${(props) => props.theme.secondary}
    );
    color: white;
    border: 0;
  `,
  secondary: css`
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  `,
};

const ButtonStyles = styled.button`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
  ${(props) => sizes[props.$size] || sizes.lg};
  ${(props) => variants[props.$variant] || variants.primary};
  ${(props) =>
    props.height &&
    css`
      height: ${props.height};
    `};
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
const Button = ({
  type = "button",
  children,
  onClick = () => {},
  href,
  size = "lg",
  variant = "primary",
  isLoading = false,
  ...props
}) => {
  const navigate = useNavigate();
  return (
    <ButtonStyles
      type={type}
      onClick={href ? () => navigate(href) : onClick}
      $size={size}
      $variant={variant}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="20px" borderSize="3px"></LoadingSpinner>
      ) : (
        children
      )}
    </ButtonStyles>
  );
};

export default Button;
