import React from "react";
import styled from "styled-components";
import PostCategory from "./components/PostCategory";
import PostTitle from "./components/PostTitle";
import PostMeta from "./components/PostMeta";
import PostDescription from "./components/PostDescription";
import PostThumbnail from "./components/PostThumbnail";
import { formatDate } from "utils/formatDate";
import { readingTime } from "utils/readingTime";

const PostItemStyles = styled.div`
  .post-content {
    font-size: 14px;
  }
  /* Reading time sits on the cover, opposite the category, so the meta
     row under the title only holds the author and date */
  .post-item__reading {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 2;
    padding: 3px 10px;
    border-radius: 100rem;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
  }
`;

const PostItem = ({ data, ...props }) => {
  if (!data) return;
  const {
    title,
    slug,
    thumbnail,
    createdAt,
    user,
    categories,
    desc,
    content,
    likeCount,
    commentCount,
  } = data;
  const category = categories?.[0];
  return (
    <PostItemStyles>
      <PostThumbnail href={slug} url={thumbnail}>
        {category && (
          <PostCategory absolute href={`/category/${category.slug}`}>
            {category.name}
          </PostCategory>
        )}
        <span className="post-item__reading">
          {readingTime(content)} min read
          {likeCount > 0 && ` · ♥ ${likeCount}`}
          {commentCount > 0 && ` · 💬 ${commentCount}`}
        </span>
      </PostThumbnail>
      <div className="post-content">
        <PostTitle href={slug}>{title}</PostTitle>
        <PostMeta
          auth={user}
          date={formatDate(createdAt)}
        ></PostMeta>
        {desc && <PostDescription>{desc}</PostDescription>}
      </div>
    </PostItemStyles>
  );
};

export default PostItem;
