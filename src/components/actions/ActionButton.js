import React from "react";
import styled, { css } from "styled-components";

const ActionButtonStyles = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  &:hover {
    color: ${(props) => props.theme.primary};
    border-color: ${(props) => props.theme.primary};
  }
  /* A toggle that is on, e.g. a featured post's star */
  &[aria-pressed="true"] {
    color: #f39c12;
    border-color: rgba(243, 156, 18, 0.5);
    background: rgba(243, 156, 18, 0.1);
    svg {
      fill: currentColor;
    }
  }
  /* Still clickable so it can explain why it can't be used */
  &[aria-disabled="true"] {
    opacity: 0.45;
  }
  ${(props) =>
    props.$danger &&
    css`
      &:hover {
        color: #e74c3c;
        border-color: #e74c3c;
        background: rgba(231, 76, 60, 0.08);
      }
    `}
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Small outlined icon button for table rows. `label` names it for screen
// readers and, unless `hint` says more, as a tooltip. `pressed` makes it
// a toggle.
const ActionButton = ({
  label,
  hint,
  danger = false,
  pressed,
  disabled,
  onClick = () => {},
  children,
}) => {
  return (
    <ActionButtonStyles
      type="button"
      aria-label={label}
      title={hint || label}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      $danger={danger}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.8"
        stroke="currentColor"
        aria-hidden="true"
      >
        {children}
      </svg>
    </ActionButtonStyles>
  );
};

export default ActionButton;
