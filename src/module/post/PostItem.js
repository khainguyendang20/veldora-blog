import React from "react";
import styled from "styled-components";
import PostCategory from "./components/PostCategory";
import PostTitle from "./components/PostTitle";
import PostMeta from "./components/PostMeta";
import PostDescription from "./components/PostDescription";
import PostThumbnail from "./components/PostThumbnail";

const PostItemStyles = styled.div`
  /* max-width: 340px; */
  .post-content {
    font-size: 14px;
  }
`;

const PostItem = ({ data, ...props }) => {
  if (!data) return;
  const { title, slug, thumbnail, createdAt, user, categories } = data;
  const date = new Date(createdAt.seconds * 1000).toLocaleDateString("vi-VI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <PostItemStyles>
      <PostThumbnail
        href={slug}
        url={thumbnail}
      >
        <PostCategory absolute>{categories[0].name}</PostCategory>
      </PostThumbnail>
      <div className="post-content">
        <PostTitle href={slug}>{title}</PostTitle>
        <PostMeta auth={user} date={date}></PostMeta>
        <PostDescription>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis
          cumque sit odit non, est fuga corporis iste eos ipsum repudiandae hic
          officiis eveniet tempore optio temporibus voluptatum tempora totam
          ullam.
        </PostDescription>
      </div>
    </PostItemStyles>
  );
};

export default PostItem;
