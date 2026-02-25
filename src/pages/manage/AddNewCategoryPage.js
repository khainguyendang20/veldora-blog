import { Button } from "components/button";
import { Radio } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import { Input } from "components/input";
import { Label } from "components/label";
import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";
import { categoryStatus, userRole } from "utils/constants";
import { useAuthStore } from "store";

const AddNewCategoryPage = () => {
  const { user: currentUser } = useAuthStore((state) => state);
  const { control, watch, handleSubmit, reset } = useForm({
    mode: "onSubmit",
    defaultValues: {
      name: "",
      slug: "",
      status: 0,
      createdAt: new Date(),
    },
  });

  const handleAddNewCategory = async (values) => {
    try {
      const colRef = collection(db, "categories");
      await addDoc(colRef, {
        ...values,
        slug: slugify(values.slug || values.name, { lower: true }),
        status: Number(values.status),
        createdAt: serverTimestamp(),
      });
      toast.success("Create new category successfully!");
      reset({
        name: "",
        slug: "",
        status: 0,
      });
    } catch (error) {
      toast.error("Error creating category!");
    }
  };

  // Only Admin and Mod can add categories
  if (
    currentUser?.role !== userRole.ADMIN &&
    currentUser?.role !== userRole.MOD
  ) {
    return (
      <FormContainer>
        <Heading>Access Denied</Heading>
        <p>You do not have permission to access this page.</p>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Heading>Add new category</Heading>
      <form onSubmit={handleSubmit(handleAddNewCategory)}>
        <div className="field-format">
          <Field>
            <Label>Name</Label>
            <Input name="name" control={control} placeholder=""></Input>
          </Field>
          <Field>
            <Label>Slug</Label>
            <Input name="slug" control={control} placeholder=""></Input>
          </Field>
        </div>
        <Field>
          <Label>Status</Label>
          <FieldCheckboxes>
            <Radio
              name="status"
              control={control}
              checked={Number(watch("status")) === categoryStatus.UNAPPROVED}
              value={categoryStatus.UNAPPROVED}
            >
              Unapproved
            </Radio>
            <Radio
              name="status"
              control={control}
              checked={Number(watch("status")) === categoryStatus.APPROVED}
              value={categoryStatus.APPROVED}
            >
              Approved
            </Radio>
          </FieldCheckboxes>
        </Field>
        <Button type="submit">Create</Button>
      </form>
    </FormContainer>
  );
};

export default AddNewCategoryPage;
