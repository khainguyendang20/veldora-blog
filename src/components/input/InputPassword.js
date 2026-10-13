import React, { useState } from "react";
import Input from "./Input";
import { IconEyeToggle } from "components/icons";

const InputPassword = ({ control, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!control) return null;
  const { error, placeholder = "Enter your password..." } = props;
  return (
    <Input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder={placeholder}
      control={control}
      error={error}
    >
      <span
        className="input-icon"
        onClick={() => setShowPassword(!showPassword)}
      >
        <IconEyeToggle isOpen={showPassword}></IconEyeToggle>
      </span>
    </Input>
  );
};

export default InputPassword;
