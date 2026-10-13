import { Button } from "components/button";
import { Field } from "components/field";
import { Input } from "components/input";
import ImageUpload from "components/input/ImageUpload";
import { Label } from "components/label";
import Heading from "components/layout/Heading";
import { Textarea } from "components/textarea";
import { db } from "config/firebase-config";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import useImageUpload from "hooks/useImageUpload";
import FormContainer from "layout/FormContainer";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";

// Firestore batches hold at most 500 writes
const batchSize = 400;

// Posts embed their author's name and avatar, so copy the new ones over
const syncAuthorOnPosts = async (uid, author) => {
  const snapshot = await getDocs(
    query(collection(db, "posts"), where("user.id", "==", uid))
  );
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + batchSize).forEach((post) =>
      batch.update(post.ref, {
        "user.fullname": author.fullname,
        "user.avatar": author.avatar,
      })
    );
    await batch.commit();
  }
};

const ProfileSettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      fullname: user.fullname || "",
      description: user.description || "",
    },
  });
  const { image, setImage, progress, handleSelectImage, handleDeleteImage } =
    useImageUpload();
  const [initialAvatar] = useState(user.avatar || "");
  useEffect(() => setImage(initialAvatar), [initialAvatar, setImage]);

  const handleSave = async (values) => {
    const fullname = values.fullname.trim();
    if (!fullname) {
      toast.error("Please enter your name.");
      return;
    }
    // Firestore rules only let users change these three fields themselves
    const profile = {
      fullname,
      description: values.description.trim(),
      avatar: image,
    };
    try {
      await updateDoc(doc(db, "users", user.uid), profile);
      await syncAuthorOnPosts(user.uid, profile);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Could not update your profile, please try again.");
    }
  };

  return (
    <FormContainer>
      <Heading>Profile</Heading>
      {user.username && (
        <p style={{ marginBottom: "24px" }}>
          <Link to={`/profile/${user.username}`}>View your public profile</Link>
        </p>
      )}
      <form onSubmit={handleSubmit(handleSave)} autoComplete="off">
        <div className="field-format">
          <Field>
            <Label>Avatar</Label>
            <ImageUpload
              name="avatar"
              progress={progress}
              image={image}
              onChange={handleSelectImage}
              handleDeleteImage={handleDeleteImage}
            ></ImageUpload>
          </Field>
          <Field>
            <Label htmlFor="fullname">Full name</Label>
            <Input name="fullname" control={control}></Input>
            <Label htmlFor="description">Bio</Label>
            <Textarea
              name="description"
              control={control}
              placeholder="A few words about you..."
            ></Textarea>
          </Field>
        </div>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          Save profile
        </Button>
      </form>
    </FormContainer>
  );
};

export default ProfileSettingsPage;
