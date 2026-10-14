import React from "react";
import styled from "styled-components";
import { useController } from "react-hook-form";

const TextareaStyles = styled.div`
  position: relative;
  width: 100%;
  textarea {
    width: 100%;
    min-height: 140px;
    padding: 12px 14px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text);
    font-size: 15px;
    resize: vertical;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }
  textarea:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 0 0 3px rgba(41, 128, 185, 0.18);
  }
  textarea::placeholder {
    color: var(--color-muted);
  }
`;
/**
 *
 * @param {*} placeholder(optional) - Placeholder of Textarea
 * @param {*} name(optional) - name of Textarea
 * @param {*} control - control from react hook form
 * @returns Textarea
 */
const Textarea = ({
  name = "",
  type = "text",
  children,
  control,
  ...props
}) => {
  const { field } = useController({
    control,
    name,
    defaultValue: "",
  });
  return (
    <TextareaStyles>
      <textarea id={name} type={type} {...field} {...props} />
    </TextareaStyles>
  );
};

export default Textarea;
