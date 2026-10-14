import React from "react";
import { useThemeStore } from "store";
import styled from "styled-components";

const ThemeToggleStyles = styled.button`
  border: 0;
  background: none;
  color: inherit;
  line-height: 1;
  cursor: pointer;
  .theme-toggle__icon {
    font-size: 22px;
  }
`;

// Switches light/dark mode. With `showLabel` it also names the mode it
// switches to, for the dashboard sidebar; `className` lets it borrow the
// surrounding link styles.
const ThemeToggle = ({ showLabel = false, className }) => {
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const next = mode === "dark" ? "light" : "dark";
  const label = `Switch to ${next} mode`;
  return (
    <ThemeToggleStyles
      type="button"
      className={className}
      onClick={toggleMode}
      aria-label={label}
      title={label}
    >
      <span
        className="theme-toggle__icon sidebar__link-icon"
        aria-hidden="true"
      >
        {mode === "dark" ? "☀" : "☾"}
      </span>
      {showLabel && (
        <span className="sidebar__link-title">
          {next === "dark" ? "Dark mode" : "Light mode"}
        </span>
      )}
    </ThemeToggleStyles>
  );
};

export default ThemeToggle;
