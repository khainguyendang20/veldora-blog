import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { collection, orderBy, query, where } from "firebase/firestore";
import usePaginatedQuery from "hooks/usePaginatedQuery";
import HomeSection from "module/home/HomeSection";
import PostList from "module/post/PostList";
import React from "react";
import { postStatus } from "utils/constants";
import useDocumentMeta from "hooks/useDocumentMeta";

// Every approved post, newest first
const BlogPage = () => {
  useDocumentMeta({ title: "All posts" });
  const { data, loading, error, hasMore, loadingMore, loadMore } =
    usePaginatedQuery(
      () =>
        query(
          collection(db, "posts"),
          where("status", "==", postStatus.APPROVED),
          orderBy("createdAt", "desc")
        ),
      []
    );
  return (
    <HomeSection>
      <Heading>All posts</Heading>
      <PostList
        posts={data}
        loading={loading}
        error={error}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      ></PostList>
    </HomeSection>
  );
};

export default BlogPage;
