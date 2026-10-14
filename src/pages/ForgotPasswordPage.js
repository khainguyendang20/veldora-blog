import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/button";
import { Field } from "components/field";
import { Input } from "components/input";
import { Label } from "components/label";
import { auth } from "config/firebase-config";
import { sendPasswordResetEmail } from "firebase/auth";
import useDocumentMeta from "hooks/useDocumentMeta";
import LayoutAuthentication from "layout/LayoutAuthentication";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { authErrorMessage } from "utils/authErrorMessage";
import * as yup from "yup";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Enter your email address"),
});

const ForgotPasswordPage = () => {
  useDocumentMeta({ title: "Reset password" });
  const [sentTo, setSentTo] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange", resolver: yupResolver(schema) });

  const handleReset = async ({ email }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSentTo(email);
    } catch (error) {
      // Unknown emails are not reported, so this page can't be used to
      // find out who has an account
      if (error?.code === "auth/user-not-found") {
        setSentTo(email);
        return;
      }
      toast.error(authErrorMessage(error));
    }
  };

  if (sentTo) {
    return (
      <LayoutAuthentication
        title="Check your email"
        subtitle={
          <>
            If an account exists for <strong>{sentTo}</strong>, a link to
            reset its password is on its way. It can take a few minutes;
            check your spam folder too.
          </>
        }
      >
        <Button href="/login" className="auth__submit">
          Back to sign in
        </Button>
        <p className="auth__switch">
          Wrong address?{" "}
          <button
            type="button"
            className="auth__link"
            onClick={() => setSentTo("")}
          >
            Try another email
          </button>
        </p>
      </LayoutAuthentication>
    );
  }

  return (
    <LayoutAuthentication
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new password."
    >
      <form onSubmit={handleSubmit(handleReset)} noValidate>
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
        <Button
          type="submit"
          className="auth__submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Send reset link
        </Button>
      </form>
      <p className="auth__switch">
        Remembered it?{" "}
        <Link to="/login" className="auth__link">
          Sign in
        </Link>
      </p>
    </LayoutAuthentication>
  );
};

export default ForgotPasswordPage;
