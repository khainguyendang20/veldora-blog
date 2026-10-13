import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import PostForm from "module/post/PostForm";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { isStaffRole } from "utils/constants";

const UpdatePostPage = () => {
  const [params] = useSearchParams();
  const postId = params.get("id");
  const user = useAuthStore((state) => state.user);
  const [post, setPost] = useState(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return;
      try {
        const snapshot = await getDoc(doc(db, "posts", postId));
        if (snapshot.data()) setPost(snapshot.data());
      } catch (error) {
        // Firestore rules refuse other users' unpublished posts
        setDenied(true);
      }
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

  // Approved posts are readable by everyone, so check ownership here too
  const canEdit =
    post && (isStaffRole(user?.role) || post.user?.id === user?.uid);
  if (denied || (post && !canEdit)) {
    return (
      <FormContainer>
        <Heading>Access Denied</Heading>
        <p>You can only edit your own posts.</p>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Heading>Update post</Heading>
      {post && (
        <PostForm
          key={postId}
          defaultValues={post}
          postId={postId}
          onSubmit={handleUpdatePost}
          onImageDeleted={handleImageDeleted}
          submitLabel="Update Post"
        ></PostForm>
      )}
    </FormContainer>
  );
};

export default UpdatePostPage;
