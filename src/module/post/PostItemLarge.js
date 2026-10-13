import React from "react";
import styled from "styled-components";
import PostThumbnail from "./components/PostThumbnail";
import { formatDate } from "utils/formatDate";
import PostCategory from "./components/PostCategory";
import PostTitle from "./components/PostTitle";
import PostMeta from "./components/PostMeta";

const PostItemLargeStyles = styled.div`
  position: relative;
  width: 760px;
  .post-content {
    position: absolute;
    bottom: 0;
    margin: 12px;
    z-index: 2;
    .post-categories {
      display: flex;
      gap: 8px;
    }
    .post-title a {
      color: white;
    }
  }
  .post-auth-name {
    color: white;
  }
  @media only screen and (max-width: 1024px) {
    width: 100%;
  }
`;

const PostItemLarge = (props) => {
  const { data, ...rest } = props;

  if (!data) return;
  const { title, slug, thumbnail, createdAt, user } = data;
  return (
    <PostItemLargeStyles className="post-large" {...rest}>
      <PostThumbnail
        href={slug}
        height="480px"
        url={thumbnail}
      ></PostThumbnail>
      <div className="post-content">
        <div className="post-categories">
          {(data.categories || []).map((category) => (
            <PostCategory key={category.id || category.slug} href={`/category/${category.slug}`}>
              {category.name}
            </PostCategory>
          ))}
        </div>
        <PostTitle href={slug} size="32px" color="white">
          {title}
        </PostTitle>
        <PostMeta
          color="white"
          date={formatDate(createdAt)}
          auth={user}
        ></PostMeta>
      </div>
    </PostItemLargeStyles>
  );
};

export default PostItemLarge;
