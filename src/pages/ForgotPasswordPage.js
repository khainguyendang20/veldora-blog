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
    .email("Please enter valid email")
    .required("Please enter your email"),
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

  return (
    <LayoutAuthentication>
      {sentTo ? (
        <div className="form" style={{ textAlign: "center" }}>
          <p>
            If an account exists for <strong>{sentTo}</strong>, a link to
            reset its password is on its way. Check your inbox and spam
            folder.
          </p>
          <p style={{ marginTop: "24px" }}>
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleReset)} className="form">
          <Field>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email address..."
              control={control}
              error={errors?.email?.message}
            ></Input>
          </Field>
          <div className="have-account">
            Remembered it? <Link to="/login">Sign in</Link>
          </div>
          <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </LayoutAuthentication>
  );
};

export default ForgotPasswordPage;
