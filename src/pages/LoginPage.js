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
import GoogleSignInButton from "module/auth/GoogleSignInButton";
import useDocumentMeta from "hooks/useDocumentMeta";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Enter your email address"),
  password: yup
    .string()
    .min(8, "Passwords are at least 8 characters")
    .required("Enter your password"),
});

const LoginPage = () => {
  useDocumentMeta({ title: "Sign in" });
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
    <LayoutAuthentication
      title="Welcome back"
      subtitle="Sign in to follow writers, save posts and publish your own."
    >
      <GoogleSignInButton></GoogleSignInButton>
      <p className="auth__divider">or sign in with email</p>
      <form onSubmit={handleSubmit(handleLogin)} noValidate>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            control={control}
            error={errors?.email?.message}
          ></Input>
        </Field>
        <Field>
          <div className="auth__label-row">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="auth__link">
              Forgot password?
            </Link>
          </div>
          <InputPassword
            placeholder="Your password"
            autoComplete="current-password"
            control={control}
            error={errors?.password?.message}
          ></InputPassword>
        </Field>
        <Button
          type="submit"
          className="auth__submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Sign in
        </Button>
      </form>
      <p className="auth__switch">
        New to Veldora Blog?{" "}
        <Link to="/register" className="auth__link">
          Create an account
        </Link>
      </p>
    </LayoutAuthentication>
  );
};

export default LoginPage;
