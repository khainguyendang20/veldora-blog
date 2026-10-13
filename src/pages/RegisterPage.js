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
import { authErrorMessage } from "utils/authErrorMessage";
import useDocumentMeta from "hooks/useDocumentMeta";

const schema = yup.object({
  fullname: yup.string().required("Please enter your fullname"),
  email: yup
    .string()
    .email("Please enter valid email")
    .required("Please enter your email"),
  password: yup
    .string()
    .min(8, "Your password must be least 8 characters or greater")
    .required("Please enter your password"),
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
      toast.success("Registered successfully!");
      navigate("/");
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };
  return (
    <LayoutAuthentication>
      <form
        autoComplete="off"
        onSubmit={handleSubmit(handleSignUp)}
        className="form"
      >
        <Field>
          <Label htmlFor="fullname">Fullname</Label>
          <Input
            type="text"
            name="fullname"
            className="input"
            placeholder="Enter your fullname..."
            control={control}
            error={errors?.fullname?.message}
          ></Input>
        </Field>
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
          Do you already have an account?
          <Link to="/login" style={{}}>
            Login now
          </Link>
        </div>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          Sign Up
        </Button>
      </form>
    </LayoutAuthentication>
  );
};

export default RegisterPage;
