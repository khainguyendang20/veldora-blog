import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

const PostTitleStyles = styled.h3`
  margin: 8px 0;
  font-size: ${(props) => props.size};
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  ${(props) =>
    props.color &&
    css`
      color: ${props.color};
    `};
  @media only screen and (max-width: 640px) {
    font-size: 14px;
    margin: 0;
  }
`;

const PostTitle = ({ size = "18px", color, href = "#", children }) => {
  return (
    <PostTitleStyles size={size} color={color} className="post-title">
      <Link to={`/post/${href}`}>{children}</Link>
    </PostTitleStyles>
  );
};

export default PostTitle;
