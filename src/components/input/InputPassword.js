import React, { useState } from "react";
import Input from "./Input";
import { IconEyeToggle } from "components/icons";

// Password field with a show/hide toggle. `autoComplete` tells password
// managers whether to fill a saved password ("current-password") or offer
// a new one ("new-password").
const InputPassword = ({
  control,
  error,
  placeholder = "Enter your password...",
  autoComplete = "current-password",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!control) return null;
  return (
    <Input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder={placeholder}
      autoComplete={autoComplete}
      control={control}
      error={error}
    >
      <button
        type="button"
        className="input-icon"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        onClick={() => setShowPassword(!showPassword)}
      >
        <IconEyeToggle isOpen={showPassword}></IconEyeToggle>
      </button>
    </Input>
  );
};

export default InputPassword;
