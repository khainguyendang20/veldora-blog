import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Image } from "components/image";
import { thumbnailPlaceholder } from "utils/constants";

const PostThumbnailStyles = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  flex-shrink: 0;
  height: ${(props) => (props.height ? props.height : "200px")};
  .post-thumb__frame {
    color: white;
    height: 100%;
    display: block;
    width: 100%;
    position: relative;
    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      position: relative;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.4),
        rgba(0, 0, 0, 0)
      );
      z-index: 1;
    }
  }
  @media only screen and (max-width: 640px) {
  }
`;

// Links to the post when given its slug as `href`; without one (e.g. on
// the post page itself) it is just the image
const PostThumbnail = ({
  url,
  href,
  height,
  className = "",
  imageWidth = 800,
  children,
}) => {
  const image = (
    <>
      <Image
        src={url}
        fallback={thumbnailPlaceholder}
        resizeTo={imageWidth}
        loading="lazy"
      />
      <div className="overlay"></div>
    </>
  );
  return (
    <PostThumbnailStyles
      height={height}
      className={`post-thumb ${className}`.trim()}
    >
      {href ? (
        <Link className="post-thumb__frame" to={`/post/${href}`}>
          {image}
        </Link>
      ) : (
        <div className="post-thumb__frame">{image}</div>
      )}
      {children}
    </PostThumbnailStyles>
  );
};

export default PostThumbnail;
