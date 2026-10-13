import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import PostList from "module/post/PostList";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "store";

// A bookmark may outlive its post, or the post may have been unpublished
// and become unreadable; those are skipped
const readPost = async (postId) => {
  try {
    const snapshot = await getDoc(doc(db, "posts", postId));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    return null;
  }
};

const SavedPostsPage = () => {
  const uid = useAuthStore((state) => state.user?.uid);
  const [state, setState] = useState({ posts: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const bookmarks = await getDocs(
          query(
            collection(db, "users", uid, "bookmarks"),
            orderBy("createdAt", "desc")
          )
        );
        const posts = await Promise.all(
          bookmarks.docs.map((bookmark) => readPost(bookmark.id))
        );
        if (!cancelled) {
          setState({ posts: posts.filter(Boolean), loading: false, error: null });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setState({ posts: [], loading: false, error });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return (
    <>
      <Heading>Saved posts</Heading>
      <PostList
        posts={state.posts}
        loading={state.loading}
        error={state.error}
        emptyText="Posts you save will show up here."
      ></PostList>
    </>
  );
};

export default SavedPostsPage;
