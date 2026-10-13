import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import PostForm from "module/post/PostForm";
import React from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "store";

const AddNewPostPage = () => {
  const { user } = useAuthStore((state) => state);

  const handleCreatePost = async (payload) => {
    // Posts are public, so embed only the public profile fields. The id
    // must be the auth uid: Firestore rules check it for ownership.
    await addDoc(collection(db, "posts"), {
      ...payload,
      user: {
        id: user.uid,
        fullname: user.fullname || "",
        username: user.username || "",
        avatar: user.avatar || "",
      },
      createdAt: serverTimestamp(),
    });
    toast.success("Create new post successfully!");
  };

  return (
    <FormContainer>
      <Heading>Add new post</Heading>
      <PostForm
        onSubmit={handleCreatePost}
        submitLabel="Create Post"
        resetAfterSubmit
      ></PostForm>
    </FormContainer>
  );
};

export default AddNewPostPage;
