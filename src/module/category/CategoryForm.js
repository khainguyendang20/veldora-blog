import { Button } from "components/button";
import { Radio } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import { Input } from "components/input";
import { Label } from "components/label";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";
import { categoryStatus } from "utils/constants";

const emptyCategory = {
  name: "",
  slug: "",
  status: categoryStatus.UNAPPROVED,
};

// Shared form for creating and editing categories. Normalizes slug and
// status, then hands the payload to `onSubmit`.
const CategoryForm = ({
  defaultValues = emptyCategory,
  onSubmit,
  submitLabel,
  resetAfterSubmit = false,
}) => {
  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ mode: "onSubmit", defaultValues });
  const watchStatus = Number(watch("status"));

  const handleSaveCategory = async (values) => {
    try {
      await onSubmit({
        ...values,
        slug: slugify(values.slug || values.name, { lower: true }),
        status: Number(values.status),
      });
      if (resetAfterSubmit) reset(emptyCategory);
    } catch (error) {
      toast.error("Something went wrong, please try again!");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSaveCategory)}>
      <div className="field-format">
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input name="name" control={control} placeholder=""></Input>
        </Field>
        <Field>
          <Label htmlFor="slug">Slug</Label>
          <Input name="slug" control={control} placeholder=""></Input>
        </Field>
      </div>
      <Field>
        <Label>Status</Label>
        <FieldCheckboxes>
          <Radio
            name="status"
            control={control}
            checked={watchStatus === categoryStatus.UNAPPROVED}
            value={categoryStatus.UNAPPROVED}
          >
            Unapproved
          </Radio>
          <Radio
            name="status"
            control={control}
            checked={watchStatus === categoryStatus.APPROVED}
            value={categoryStatus.APPROVED}
          >
            Approved
          </Radio>
        </FieldCheckboxes>
      </Field>
      <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
};

export default CategoryForm;
