import { Radio, Toggle } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import { Input } from "components/input";
import ImageUpload from "components/input/ImageUpload";
import { Label } from "components/label";
import { Textarea } from "components/textarea";
import { Button } from "components/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import slugify from "slugify";
import { postStatus } from "utils/constants";
import useFirebaseImage from "hooks/useFireBaseImage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "config/firebase-config";
import { toast } from "react-toastify";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { imgbbAPI } from "config/apiConfig";
import axios from "axios";
import ImageUploader from "quill-image-uploader";

Quill.register("modules/imageUploader", ImageUploader);

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["link", "image"],
  ],
  imageUploader: {
    upload: async (file) => {
      const bodyFormData = new FormData();
      bodyFormData.append("image", file);
      const response = await axios({
        method: "post",
        url: imgbbAPI,
        data: bodyFormData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data.url;
    },
  },
};

const emptyPost = {
  title: "",
  slug: "",
  status: postStatus.PENDING,
  categories: [],
  featured: false,
};

const toOption = (category) => ({ label: category.name, value: category.id });

// Shared form for creating and editing posts. Builds the Firestore payload
// and hands it to `onSubmit`; the page decides how to persist it.
const PostForm = ({
  defaultValues = emptyPost,
  onSubmit,
  onImageDeleted,
  submitLabel,
  resetAfterSubmit = false,
}) => {
  const { control, watch, setValue, handleSubmit, getValues, reset } =
    useForm({ mode: "onChange", defaultValues });
  const [optionValues, setOptionValues] = useState(
    (defaultValues.categories || []).map(toOption)
  );
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [content, setContent] = useState(defaultValues.content || "");
  const watchStatus = watch("status");
  const watchFeatured = watch("featured");
  const {
    image,
    setImage,
    handleResetUpload,
    progress,
    handleSelectImage,
    handleDeleteImage,
  } = useFirebaseImage(
    setValue,
    getValues,
    defaultValues.image_name,
    onImageDeleted
  );

  useEffect(() => {
    if (defaultValues.thumbnail) setImage(defaultValues.thumbnail);
  }, [defaultValues.thumbnail, setImage]);

  useEffect(() => {
    async function getCategories() {
      const q = query(collection(db, "categories"), where("status", "==", 1));
      const querySnapshot = await getDocs(q);
      const result = [];
      querySnapshot.forEach((doc) => {
        result.push(toOption({ id: doc.id, ...doc.data() }));
      });
      setCategoryOptions(result);
    }
    getCategories();
  }, []);

  const handleSavePost = async (values) => {
    try {
      const categories = await Promise.all(
        optionValues.map(async (option) => {
          const data = (await getDoc(doc(db, "categories", option.value))).data();
          return { id: option.value, ...data };
        })
      );
      await onSubmit({
        ...values,
        thumbnail: image,
        slug: slugify(values.slug || values.title, { lower: true }),
        status: Number(values.status),
        categories,
        categoryIds: categories.map((category) => category.id),
        content,
      });
      if (resetAfterSubmit) {
        reset(emptyPost);
        handleResetUpload();
        setOptionValues([]);
        setContent("");
      }
    } catch (error) {
      toast.error("Something went wrong, please try again!");
    }
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit(handleSavePost)}>
      <div className="field-format">
        <Field>
          <Label htmlFor="title">Title</Label>
          <Input name="title" control={control} placeholder="Title"></Input>
        </Field>
        <Field>
          <Label htmlFor="slug">Slug</Label>
          <Input name="slug" control={control}></Input>
        </Field>
      </div>
      <div className="field-format">
        <Field>
          <Label htmlFor="desc">Short description</Label>
          <Textarea
            name="desc"
            control={control}
            placeholder="Short Description..."
          ></Textarea>
        </Field>
        <Field>
          <Label>Thumbnail</Label>
          <ImageUpload
            name="thumbnail"
            progress={progress}
            image={image}
            onChange={handleSelectImage}
            handleDeleteImage={handleDeleteImage}
          ></ImageUpload>
        </Field>
      </div>
      <div
        className="entry-content"
        style={{
          marginBottom: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Label>Contents</Label>
        <ReactQuill
          modules={quillModules}
          theme="snow"
          value={content}
          onChange={setContent}
        />
      </div>
      <div className="field-format">
        <Field>
          <Label>Status</Label>
          <FieldCheckboxes>
            <Radio
              name="status"
              control={control}
              checked={Number(watchStatus) === postStatus.APPROVED}
              value={postStatus.APPROVED}
            >
              Approved
            </Radio>
            <Radio
              name="status"
              control={control}
              checked={Number(watchStatus) === postStatus.PENDING}
              value={postStatus.PENDING}
            >
              Pending
            </Radio>
            <Radio
              name="status"
              control={control}
              checked={Number(watchStatus) === postStatus.REJECTED}
              value={postStatus.REJECTED}
            >
              Rejected
            </Radio>
          </FieldCheckboxes>
        </Field>
        <Field>
          <Label>Category</Label>
          <Select
            isMulti
            name="categories"
            options={categoryOptions}
            className="basic-multi-select"
            placeholder="Select categories..."
            classNamePrefix="select"
            onChange={setOptionValues}
            value={optionValues}
          />
        </Field>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          margin: "12px 0 24px",
        }}
      >
        <Label>Featured Post:</Label>
        <Toggle
          on={watchFeatured === true}
          onClick={() => setValue("featured", !watchFeatured)}
        ></Toggle>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
};

export default PostForm;
