import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import useDocumentMeta from "hooks/useDocumentMeta";
import HomeSection from "module/home/HomeSection";
import PostList from "module/post/PostList";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "store";
import { postStatus } from "utils/constants";

// Firestore's "in" filter takes at most 30 values
const maxAuthors = 30;
const feedSize = 30;

// Newest approved posts by the authors the reader follows
const FollowingPage = () => {
  useDocumentMeta({ title: "Following" });
  const uid = useAuthStore((state) => state.user?.uid);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [state, setState] = useState({ posts: [], loading: true, follows: 0 });

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const load = async () => {
      try {
        const follows = await getDocs(
          query(
            collection(db, "users", uid, "following"),
            orderBy("createdAt", "desc"),
            limit(maxAuthors)
          )
        );
        const authorIds = follows.docs.map((doc) => doc.id);
        if (!authorIds.length) {
          if (!cancelled) setState({ posts: [], loading: false, follows: 0 });
          return;
        }
        const posts = await getDocs(
          query(
            collection(db, "posts"),
            where("status", "==", postStatus.APPROVED),
            where("user.id", "in", authorIds),
            orderBy("createdAt", "desc"),
            limit(feedSize)
          )
        );
        if (!cancelled) {
          setState({
            posts: posts.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            loading: false,
            follows: authorIds.length,
          });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setState({ posts: [], loading: false, error, follows: 0 });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (!isAuthLoading && !uid) {
    return (
      <HomeSection>
        <Heading>Following</Heading>
        <p>
          <Link to="/login">Sign in</Link> to see posts from authors you follow.
        </p>
      </HomeSection>
    );
  }

  return (
    <HomeSection>
      <Heading>Following</Heading>
      <PostList
        posts={state.posts}
        loading={isAuthLoading || state.loading}
        error={state.error}
        emptyText={
          state.follows
            ? "The authors you follow haven't posted yet."
            : "Follow authors from their profile or posts to see their new posts here."
        }
      ></PostList>
    </HomeSection>
  );
};

export default FollowingPage;
