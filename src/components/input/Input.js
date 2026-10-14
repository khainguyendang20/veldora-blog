import React from "react";
import { useController } from "react-hook-form";
import styled from "styled-components";

const InputStyles = styled.div`
  position: relative;
  width: 100%;
  input {
    width: 100%;
    border-radius: 8px;
    background: var(--color-surface);
    color: var(--color-text);
    padding: ${(props) => (props.hasIcon ? "12px 48px 12px 14px" : "12px 14px")};
    border: 1px solid var(--color-border);
    font-size: 15px;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }
  input:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px rgba(41, 128, 185, 0.18);
  }
  input::placeholder {
    color: var(--color-muted);
  }
  .input-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
  p {
    margin-top: 6px;
    font-size: 13px;
    color: #e74c3c;
  }
`;

const Input = ({ name, type = "text", control, children, ...props }) => {
  const { field } = useController({ control, name, defaultValue: "" });
  const { error } = props;
  return (
    <InputStyles hasIcon={children ? true : false}>
      <input type={type} name={name} id={name} {...props} {...field} />
      {children}
      {error && error.length > 0 && <p>{error}</p>}
    </InputStyles>
  );
};

export default Input;
