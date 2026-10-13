import Heading from "components/layout/Heading";
import { PageLoading } from "components/loading";
import { db } from "config/firebase-config";
import { collection, orderBy, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import usePaginatedQuery from "hooks/usePaginatedQuery";
import HomeSection from "module/home/HomeSection";
import PostList from "module/post/PostList";
import React from "react";
import { useParams } from "react-router-dom";
import { categoryStatus, postStatus } from "utils/constants";
import NotFoundPage from "./NotFoundPage";

// Approved posts of one approved category, newest first
const CategoryPage = () => {
  const { slug } = useParams();
  const { data: categories, loading: categoryLoading } = useFirestoreQuery(
    () =>
      query(
        collection(db, "categories"),
        where("slug", "==", slug),
        where("status", "==", categoryStatus.APPROVED)
      ),
    [slug]
  );
  const category = categories[0];
  const posts = usePaginatedQuery(
    () =>
      category
        ? query(
            collection(db, "posts"),
            where("status", "==", postStatus.APPROVED),
            where("categoryIds", "array-contains", category.id),
            orderBy("createdAt", "desc")
          )
        : null,
    [category?.id]
  );
  if (categoryLoading) return <PageLoading></PageLoading>;
  if (!category) return <NotFoundPage></NotFoundPage>;
  return (
    <HomeSection>
      <Heading>{category.name}</Heading>
      <PostList
        posts={posts.data}
        loading={posts.loading}
        error={posts.error}
        hasMore={posts.hasMore}
        loadingMore={posts.loadingMore}
        onLoadMore={posts.loadMore}
        emptyText="No posts in this category yet."
      ></PostList>
    </HomeSection>
  );
};

export default CategoryPage;
