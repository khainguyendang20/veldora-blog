import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import PostForm from "module/post/PostForm";
import React from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "store";

const AddNewPostPage = () => {
  const { user } = useAuthStore((state) => state);

  const handleCreatePost = async (payload) => {
    const userSnapshot = await getDocs(
      query(collection(db, "users"), where("email", "==", user.email))
    );
    let author = {};
    userSnapshot.forEach((doc) => {
      author = { id: doc.id, ...doc.data() };
    });
    await addDoc(collection(db, "posts"), {
      ...payload,
      user: author,
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
