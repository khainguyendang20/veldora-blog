import { IconClock } from "components/icons";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Image } from "components/image";
import { avatarDefault } from "utils/constants";

const PostMetaStyles = styled.div`
  @media only screen and (max-width: 1024px) {
    .post-auth {
      display: none;
    }
  }
  font-size: 12px;
  display: flex;
  column-gap: 8px;
  margin: 8px 0;
  color: ${(props) => props.color};
  .post-auth,
  .post-date {
    display: flex;
    column-gap: 8px;
    align-items: center;
    &-avt {
      width: 25px;
      height: 25px;
      object-fit: cover;
      border-radius: 100rem;
    }

    &-name {
      font-weight: 500;
    }
  }
  .post-date {
    column-gap: 6px;
  }
  @media only screen and (max-width: 640px) {
    display: none;
    margin: 2px 0;
    .post-date {
      display: none;
    }
  }
`;

const PostMeta = ({ color = "black", auth, date }) => {
  return (
    <PostMetaStyles className="post-meta" color={color}>
      <Link
        to={auth?.username ? `/profile/${auth.username}` : "#"}
        className="post-auth"
      >
        <Image className="post-auth-avt" src={auth?.avatar} fallback={avatarDefault} />
        <span className="post-auth-name">
          {auth?.fullname || "Unknown author"}
        </span>
      </Link>

      {date && (
        <div className="post-date">
          <span className="post-date-icon">
            <IconClock size={18} color={color}></IconClock>
          </span>
          {date}
        </div>
      )}
    </PostMetaStyles>
  );
};

export default PostMeta;
