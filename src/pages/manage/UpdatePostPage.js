import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import PostForm from "module/post/PostForm";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const UpdatePostPage = () => {
  const [params] = useSearchParams();
  const postId = params.get("id");
  const [post, setPost] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return;
      const snapshot = await getDoc(doc(db, "posts", postId));
      if (snapshot.data()) setPost(snapshot.data());
    }
    fetchPost();
  }, [postId]);

  const handleUpdatePost = async (payload) => {
    await updateDoc(doc(db, "posts", postId), payload);
    toast.success("Update post successfully!");
  };

  const handleImageDeleted = async () => {
    await updateDoc(doc(db, "posts", postId), { thumbnail: "" });
  };

  return (
    <FormContainer>
      <Heading>Update post</Heading>
      {post && (
        <PostForm
          key={postId}
          defaultValues={post}
          onSubmit={handleUpdatePost}
          onImageDeleted={handleImageDeleted}
          submitLabel="Update Post"
        ></PostForm>
      )}
    </FormContainer>
  );
};

export default UpdatePostPage;
