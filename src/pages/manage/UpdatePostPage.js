import { Radio, Toggle } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import { Input } from "components/input";
import ImageUpload from "components/input/ImageUpload";
import { Label } from "components/label";
import Heading from "components/layout/Heading";
// import TagPicker from "components/tagpicker/TagPicker";
import { Textarea } from "components/textarea";
// import PostCategory from "module/post/PostCategory";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { postStatus } from "utils/constants";
import Select from "react-select";
import { Button } from "components/button";
import slugify from "slugify";
import useFirebaseImage from "hooks/useFireBaseImage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "config/firebase-config";
import { useAuthStore } from "store";
import { toast } from "react-toastify";
import FormContainer from "layout/FormContainer";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { imgbbAPI } from "config/apiConfig";
import axios from "axios";
import ImageUploader from "quill-image-uploader";
import { useSearchParams } from "react-router-dom";
Quill.register("modules/imageUploader", ImageUploader);

const UpdatePostPage = () => {
  useAuthStore((state) => state);
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      slug: "",
      status: 2,
      categories: [],
      featured: false,
      user: {},
    },
  });
  const [params] = useSearchParams();
  const postId = params.get("id");
  const [optionValues, setOptionValues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [, setLoading] = useState(false);
  const watchStatus = watch("status");
  const watchFeatured = watch("featured");
  const [content, setContent] = useState();

  const imageUrl = getValues("thumbnail");
  const imageName = getValues("image_name");
  // const {
  //   image,
  //   setImage,
  //   progress,
  //   handleSelectImg,
  //   handleDeleteImg,
  //   handleResetUpload,
  // } = useFirebaseImage(setValue, getValues);
  const { image, setImage, progress, handleSelectImage, handleDeleteImage } =
    useFirebaseImage(setValue, getValues, imageName, deletePostImage);

  useEffect(() => {
    async function getCategories() {
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, where("status", "==", 1));
      const querySnapshot = await getDocs(q);
      let result = [];
      querySnapshot.forEach((doc) => {
        result.push({
          value: doc.id,
          label: doc.data().name,
        });
      });
      setCategories(result);
    }
    getCategories();
  }, []);

  async function deletePostImage() {
    // if (user?.role !== user.ADMIN) {
    //   Swal.fire("Failed", "You have no right to do this action", "warning");
    //   return;
    // }
    const colRef = doc(db, "posts", postId);
    await updateDoc(colRef, {
      thumnail: "",
    });
  }
  useEffect(() => {
    setImage(imageUrl);
  }, [imageUrl, setImage]);
  useEffect(() => {
    async function fetchData() {
      if (!postId) return;
      const docRef = doc(db, "posts", postId);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.data()) {
        reset(docSnapshot.data());
        setOptionValues(
          docSnapshot.data()?.categories?.map((category) => ({
            label: category.name,
            value: category.id,
          }))
        );
        setContent(docSnapshot.data()?.content || "");
        setValue("status", docSnapshot.data()?.status);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, reset]);
  // Note: 'content' intentionally excluded to avoid infinite loop
  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote"],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["link", "image"],
      ],
      imageUploader: {
        // imgbbAPI
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
    }),
    []
  );

  const handleUpdatePost = async (values) => {
    try {
      if (!isValid) return;
      // if (user?.role !== user.ADMIN) {
      //   Swal.fire("Failed", "You have no right to do this action", "warning");
      //   return;
      // }
      const categoriesSelected = await Promise.all(
        optionValues.map(async (category) => {
          const colRef = doc(db, "categories", category.value);
          const data = (await getDoc(colRef)).data();
          return { id: category.value, ...data };
        })
      );
      const colRef = doc(db, "posts", postId);
      await updateDoc(colRef, {
        ...values,
        thumbnail: image,
        slug: slugify(values.slug || values.title, { lower: true }),
        status: Number(values.status),
        categories: categoriesSelected,
        content,
      });
      toast.success("Create new post successfully!");
      setLoading(true);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <FormContainer>
      <Heading>Add new post</Heading>
      <form autoComplete="off" onSubmit={handleSubmit(handleUpdatePost)}>
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
            modules={modules}
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
              control={control}
              isMulti
              name="categories"
              options={categories}
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
        <Button type="submit">Update Post</Button>
      </form>
    </FormContainer>
  );
};

export default UpdatePostPage;
