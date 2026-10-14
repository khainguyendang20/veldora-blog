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
  /* max-width: 340px; */
  .post-content {
    font-size: 14px;
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
      </PostThumbnail>
      <div className="post-content">
        <PostTitle href={slug}>{title}</PostTitle>
        <PostMeta
          auth={user}
          date={formatDate(createdAt)}
          minutesToRead={readingTime(content)}
          likeCount={likeCount}
          commentCount={commentCount}
        ></PostMeta>
        {desc && <PostDescription>{desc}</PostDescription>}
      </div>
    </PostItemStyles>
  );
};

export default PostItem;
