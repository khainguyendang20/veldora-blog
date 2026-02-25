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
import { auth, db } from "config/firebase-config";
import { toast } from "react-toastify";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import LayoutAuthentication from "layout/LayoutAuthentication";
import slugify from "slugify";
import { userRole, userStatus } from "utils/constants";

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
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "onChange", resolver: yupResolver(schema) });
  const handleSignUp = async (values) => {
    if (!isValid) return;
    // return new Promise((resolve) => setTimeout(() => resolve(), 3000));
    await createUserWithEmailAndPassword(auth, values.email, values.password);
    await updateProfile(auth.currentUser, { displayName: values.fullname });
    toast.success("Registered successfully!!");
    // const colRef = collection(db, "users");
    // await addDoc(colRef, {
    //   fullname: values.fullname,
    //   email: values.email,
    //   password: values.password,
    // });
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      fullname: values.fullname,
      email: values.email,
      password: values.password,
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/fspade-blog.appspot.com/o/images%2F3177440.png?alt=media&token=ea29f785-7cef-47a6-af6b-a7c8c89d57d7",
      username: slugify(
        values.fullname + "-" + auth.currentUser.uid.slice(0, 10),
        {
          lower: true,
        }
      ),
      role: userRole.USER,
      status: userStatus.ACTIVE,
      createdAt: serverTimestamp(),
    });
    navigate("/");
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
