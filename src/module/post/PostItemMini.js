import React from "react";
import styled, { css } from "styled-components";
import PostThumbnail from "./components/PostThumbnail";
import PostTitle from "./components/PostTitle";
import PostCategory from "./components/PostCategory";
import PostMeta from "./components/PostMeta";

const PostMiniItemStyles = styled.div`
  position: relative;
  display: flex;
  ${(props) =>
    props.reverse &&
    css`
      flex-direction: row-reverse;
    `};
  column-gap: 12px;
  height: 100px;
  .post-thumb {
    width: 100px;
    height: 100px;
    a {
      display: block;
      width: 100px;
    }
  }
  .post-auth {
    display: none;
  }
  @media only screen and (max-width: 1024px) {
    flex-direction: column;
    gap: 4px;
    height: unset;
    .post-thumb {
      width: 100%;
      a {
        width: 100%;
      }
    }
    .post-content {
      display: flex;
      flex-direction: column;
      & > span {
        position: absolute;
        top: 4px;
        left: 4px;
        font-size: 8px;
      }
      & > h3 {
        margin: 0;
        font-size: 12px;
      }
      & > div {
        display: none;
      }
    }
  }
`;

const PostItemMini = ({ isReverse = false, data, ...props }) => {
  if (!data) return;
  const { title, slug, thumbnail, createdAt, user, categories } = data;
  const date = new Date(createdAt.seconds * 1000).toLocaleDateString("vi-VI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <PostMiniItemStyles reverse={isReverse}>
      <PostThumbnail
        href={slug}
        url={thumbnail}
      ></PostThumbnail>
      <div className="post-content">
        <PostCategory>{categories[0].name}</PostCategory>
        <PostTitle size="16px" href={slug}>
          {title || "You can make your art with canyon color"}
        </PostTitle>
        <PostMeta date={date} auth={user}></PostMeta>
      </div>
    </PostMiniItemStyles>
  );
};

export default PostItemMini;
