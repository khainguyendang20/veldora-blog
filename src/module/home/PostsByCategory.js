import { db } from "config/firebase-config";
import { collection, limit, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import PostItemLarge from "module/post/PostItemLarge";
import PostItemMini from "module/post/PostItemMini";
import React from "react";
import styled from "styled-components";

const PostsByCategoryStyles = styled.div`
  display: flex;
  column-gap: 24px;
  gap: 8px;
  .post-large {
    flex: 1;
  }
  .list-post__right {
    display: flex;
    width: 30%;
    flex-direction: column;
    justify-content: space-between;
  }
  @media only screen and (max-width: 1024px) {
    flex-direction: column;
    .list-post__right {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      width: 100%;
      gap: 6px;
    }
  }
`;

const PostsByCategory = ({ categoryId }) => {
  const { data: posts } = useFirestoreQuery(
    () =>
      query(
        collection(db, "posts"),
        where("status", "==", 1),
        where("categoryIds", "array-contains", categoryId),
        // orderBy("createdAt", "desc"),
        limit(5)
      ),
    [categoryId]
  );
  if (!posts.length) return;
  return (
    <PostsByCategoryStyles>
      <PostItemLarge data={posts[0]}></PostItemLarge>
      <div className="list-post__right">
        {posts.slice(1, posts.length).map((post) => (
          <PostItemMini key={post.id} data={post}></PostItemMini>
        ))}
      </div>
    </PostsByCategoryStyles>
  );
};

export default PostsByCategory;
