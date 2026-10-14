import { Input } from "components/input";
import { Label } from "components/label";
import React from "react";
import { useForm } from "react-hook-form";
import { Field } from "components/field";
import InputPassword from "components/input/InputPassword";
import { Button } from "components/button";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "config/firebase-config";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import LayoutAuthentication from "layout/LayoutAuthentication";
import { createUserProfile } from "module/auth/userProfile";
import GoogleSignInButton from "module/auth/GoogleSignInButton";
import { authErrorMessage } from "utils/authErrorMessage";
import useDocumentMeta from "hooks/useDocumentMeta";

const schema = yup.object({
  fullname: yup.string().trim().required("Enter your name"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Enter your email address"),
  password: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("Choose a password"),
});

const RegisterPage = () => {
  useDocumentMeta({ title: "Sign up" });
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange", resolver: yupResolver(schema) });
  const handleSignUp = async (values) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(user, { displayName: values.fullname });
      await createUserProfile(user, { fullname: values.fullname });
      toast.success("Welcome to Veldora Blog!");
      navigate("/");
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };
  return (
    <LayoutAuthentication
      title="Create your account"
      subtitle="Join to follow writers, save posts and publish your own."
    >
      <GoogleSignInButton></GoogleSignInButton>
      <p className="auth__divider">or sign up with email</p>
      <form onSubmit={handleSubmit(handleSignUp)} noValidate>
        <Field>
          <Label htmlFor="fullname">Full name</Label>
          <Input
            type="text"
            name="fullname"
            placeholder="Your name"
            autoComplete="name"
            control={control}
            error={errors?.fullname?.message}
          ></Input>
        </Field>
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
          <Label htmlFor="password">Password</Label>
          <InputPassword
            placeholder="At least 8 characters"
            autoComplete="new-password"
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
          Create account
        </Button>
      </form>
      <p className="auth__switch">
        Already have an account?{" "}
        <Link to="/login" className="auth__link">
          Sign in
        </Link>
      </p>
    </LayoutAuthentication>
  );
};

export default RegisterPage;
