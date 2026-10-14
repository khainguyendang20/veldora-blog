import { IconSearch } from "components/icons";
import React from "react";
import styled from "styled-components";

const SearchInputStyles = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  width: 260px;
  max-width: 100%;
  input {
    width: 100%;
    height: 40px;
    padding: 0 12px 0 38px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    outline: none;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }
  input:focus {
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px rgba(41, 128, 185, 0.18);
  }
  svg {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 18px;
    color: var(--color-muted);
    pointer-events: none;
  }
`;

const SearchInput = ({ placeholder = "Type to search...", ...props }) => {
  return (
    <SearchInputStyles>
      <IconSearch></IconSearch>
      <input type="search" placeholder={placeholder} {...props} />
    </SearchInputStyles>
  );
};

export default SearchInput;
