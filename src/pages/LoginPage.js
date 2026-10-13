import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/button";
import { Field } from "components/field";
import { Input } from "components/input";
import InputPassword from "components/input/InputPassword";
import { Label } from "components/label";
import LayoutAuthentication from "layout/LayoutAuthentication";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "config/firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "store";
import { toast } from "react-toastify";
import { authErrorMessage } from "utils/authErrorMessage";

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter valid email")
    .required("Please enter your email"),
  password: yup
    .string()
    .min(8, "Your password must be least 8 characters or greater")
    .required("Please enter your password"),
});

const LoginPage = () => {
  const { user } = useAuthStore((state) => state);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange", resolver: yupResolver(schema) });
  const handleLogin = async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate("/");
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };
  useEffect(() => {
    if (user?.email) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(user)]);
  return (
    <LayoutAuthentication>
      <form
        onSubmit={handleSubmit(handleLogin)}
        autoComplete="off"
        className="form"
      >
        <Field>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            name="email"
            className="input"
            placeholder="Enter your email address..."
            control={control}
            error={errors?.email?.message}
          ></Input>
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <InputPassword
            type="password"
            name="password"
            className="input"
            placeholder="Enter your password..."
            control={control}
            error={errors?.password?.message}
          ></InputPassword>
        </Field>
        <div className="have-account">
          Do not have an account?
          <Link to="/register" style={{}}>
            Register now
          </Link>
        </div>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>
    </LayoutAuthentication>
  );
};

export default LoginPage;
