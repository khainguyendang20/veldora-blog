import { Toggle } from "components/checkbox";
import { Field } from "components/field";
import { Input } from "components/input";
import ImageUpload from "components/input/ImageUpload";
import { Label } from "components/label";
import { Textarea } from "components/textarea";
import { Button } from "components/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { toSlug } from "utils/toSlug";
import { isStaffRole, postStatus } from "utils/constants";
import { useAuthStore } from "store";
import useImageUpload from "hooks/useImageUpload";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "config/firebase-config";
import { toast } from "react-toastify";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadImage } from "utils/uploadImage";
import ImageUploader from "quill-image-uploader";
import { isSlugTaken, randomSlugSuffix } from "./slug";
import useAutosave from "hooks/useAutosave";
import PostStatusField from "./PostStatusField";

Quill.register("modules/imageUploader", ImageUploader);

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["link", "image"],
  ],
  imageUploader: {
    upload: async (file) => (await uploadImage(file)).url,
  },
};

const emptyPost = {
  title: "",
  slug: "",
  status: postStatus.PENDING,
  categories: [],
  featured: false,
};

// Firestore Timestamp or Date to a datetime-local input value
const toLocalInput = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toOption = (category) => ({ label: category.name, value: category.id });

// Shared form for creating and editing posts. Builds the Firestore payload
// and hands it to `onSubmit`; the page decides how to persist it.
const PostForm = ({
  defaultValues = emptyPost,
  postId,
  onSubmit,
  onImageDeleted,
  submitLabel,
  resetAfterSubmit = false,
}) => {
  const { control, watch, setValue, handleSubmit, reset } =
    useForm({ mode: "onChange", defaultValues });
  // Only staff moderate; Firestore rules reject status/featured changes
  // from anyone else, so regular users never see those controls
  const canModerate = useAuthStore((state) => isStaffRole(state.user?.role));
  const uid = useAuthStore((state) => state.user?.uid);
  const [optionValues, setOptionValues] = useState(
    (defaultValues.categories || []).map(toOption)
  );
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [content, setContent] = useState(defaultValues.content || "");
  const watchStatus = Number(watch("status"));
  const watchFeatured = watch("featured");
  // datetime-local value ("2026-10-20T08:00") for scheduled posts
  const [publishAt, setPublishAt] = useState(() =>
    toLocalInput(defaultValues.publishAt)
  );

  // Unsaved text survives a closed tab; restoring it is offered below
  const autosaveFields = {
    title: watch("title") || "",
    slug: watch("slug") || "",
    desc: watch("desc") || "",
    content,
  };
  const autosave = useAutosave(
    postId || "new-post",
    autosaveFields,
    {
      title: defaultValues.title || "",
      slug: defaultValues.slug || "",
      desc: defaultValues.desc || "",
      content: defaultValues.content || "",
    }
  );
  const restoreAutosave = () => {
    const { title, slug, desc, content: savedContent } = autosave.saved.values;
    setValue("title", title);
    setValue("slug", slug);
    setValue("desc", desc);
    setContent(savedContent);
    autosave.dismiss();
  };
  const {
    image,
    setImage,
    handleResetUpload,
    progress,
    handleSelectImage,
    handleDeleteImage,
  } = useImageUpload(onImageDeleted);

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

  // Two posts with one slug would make one of them unreachable. A slug
  // typed by hand is the author's choice, so ask for another; one made from
  // the title just gets a short random suffix.
  const resolveSlug = async (values) => {
    const customSlug = values.slug?.trim();
    const slug = toSlug(customSlug || values.title);
    const checkOptions = { postId, uid, isStaff: canModerate };
    if (!(await isSlugTaken(slug, checkOptions))) return slug;
    if (customSlug) return null;
    return `${slug}-${randomSlugSuffix()}`;
  };

  const handleSavePost = async (values) => {
    // Counters belong to likes and comments, which may have changed since
    // the form loaded; saving these stale copies would undo them
    // eslint-disable-next-line no-unused-vars
    const { likeCount, commentCount, lastCommentId, ...fields } = values;
    const status = Number(values.status);
    const publishDate =
      status === postStatus.SCHEDULED && publishAt ? new Date(publishAt) : null;
    if (status === postStatus.SCHEDULED && !publishDate) {
      toast.error("Pick when the post should be published.");
      return;
    }
    try {
      const slug = await resolveSlug(fields);
      if (!slug) {
        toast.error("This slug is already used by another post.");
        return;
      }
      const categories = await Promise.all(
        optionValues.map(async (option) => {
          const data = (await getDoc(doc(db, "categories", option.value))).data();
          return { id: option.value, ...data };
        })
      );
      await onSubmit({
        ...fields,
        thumbnail: image,
        slug,
        status,
        publishAt: publishDate,
        categories,
        categoryIds: categories.map((category) => category.id),
        content,
      });
      autosave.clear();
      if (resetAfterSubmit) {
        reset(emptyPost);
        setPublishAt("");
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
      {autosave.saved && (
        <div className="autosave-banner" role="status">
          <span>
            You have unsaved changes from{" "}
            {new Date(autosave.saved.savedAt).toLocaleString("vi-VN")}.
          </span>
          <button type="button" onClick={restoreAutosave}>
            Restore
          </button>
          <button type="button" onClick={autosave.clear}>
            Discard
          </button>
        </div>
      )}
      <div className="field-format">
        <Field>
          <Label htmlFor="title">Title</Label>
          <Input name="title" control={control} placeholder="Title"></Input>
        </Field>
        <Field>
          <Label htmlFor="slug">Slug</Label>
          <Input
            name="slug"
            control={control}
            placeholder="Made from the title if left empty"
          ></Input>
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
        className="entry-content post-editor"
        style={{
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
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
        <PostStatusField
          control={control}
          status={watchStatus}
          savedStatus={Number(defaultValues.status)}
          canModerate={canModerate}
          publishAt={publishAt}
          onPublishAtChange={setPublishAt}
        ></PostStatusField>
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
      {canModerate && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Label>Featured on the home page</Label>
          <Toggle
            on={watchFeatured === true}
            onClick={() => setValue("featured", !watchFeatured)}
          ></Toggle>
        </div>
      )}
      <div className="form-actions">
        <Button type="submit" size="md">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
