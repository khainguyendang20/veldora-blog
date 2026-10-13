import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import React from "react";
import styled from "styled-components";
import { postStatus } from "utils/constants";
import PostItem from "./PostItem";

const relatedCount = 3;

const PostRelatedStyles = styled.div`
  .post-related__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 8px;
  }
  @media only screen and (max-width: 1024px) {
    .post-related__grid {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
`;

// Newest approved posts sharing the post's first category
const PostRelated = ({ categoryId, postId }) => {
  const { data: posts } = useFirestoreQuery(
    () =>
      categoryId
        ? query(
            collection(db, "posts"),
            where("status", "==", postStatus.APPROVED),
            where("categoryIds", "array-contains", categoryId),
            orderBy("createdAt", "desc"),
            // One extra in case the current post is among them
            limit(relatedCount + 1)
          )
        : null,
    [categoryId]
  );
  const related = posts
    .filter((post) => post.id !== postId)
    .slice(0, relatedCount);
  if (!related.length) return null;
  return (
    <PostRelatedStyles>
      <Heading>Related posts</Heading>
      <div className="post-related__grid">
        {related.map((post) => (
          <PostItem key={post.id} data={post}></PostItem>
        ))}
      </div>
    </PostRelatedStyles>
  );
};

export default PostRelated;
