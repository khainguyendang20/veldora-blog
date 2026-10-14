import React from "react";
import { useController } from "react-hook-form";
import styled from "styled-components";

const InputStyles = styled.div`
  position: relative;
  width: 100%;
  input {
    width: 100%;
    border-radius: 8px;
    background: ${(props) => props.theme.grayLight};
    padding: ${(props) => (props.hasIcon ? "20px 60px 20px 20px" : "20px")};
    border: 2px solid transparent;
    transition: all 0.2s ease-in-out;
  }
  input:focus {
    background: var(--color-surface);
    border-color: ${(props) => props.theme.grayLight};
  }
  input::-webkit-input-placeholder {
    color: #84878b;
  }
  .input-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
  p {
    font-size: 14px;
    color: red;
    font-style: italic;
    position: absolute;
    right: 0;
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
