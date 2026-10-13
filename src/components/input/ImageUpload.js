import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { LoadingSpinner } from "components/loading";
import { Image } from "components/image";
import { thumbnailPlaceholder } from "utils/constants";

const ImageUploadStyles = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${(props) => props.theme.grayLight};
  width: 100%;
  min-height: 200px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  .input__image--empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    pointer-events: none;
    img {
      max-width: 80px;
      margin-bottom: 20px;
    }
    p {
      font-weight: 500;
    }
  }
  .input__image-progress {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 20px;
    height: 4px;
    background: ${(props) => props.theme.secondary};
    transition: all 0.25s ease-in-out;
  }
  .input__image--uploaded {
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    button {
      position: absolute;
      z-index: 2;
      width: 40px;
      height: 40px;
      background: #e74c3c;
      border-radius: 4px;
      cursor: pointer;
      top: 8px;
      right: 8px;
    }
  }
  & .input__image--uploaded button:hover {
    transition: all 0.25s ease-in-out;
    background: #c0392b;
  }
`;

const ImageUpload = (props) => {
  const {
    name,
    progress = 0,
    image = "",
    handleDeleteImage = () => {},
    ...rest
  } = props;
  return (
    <ImageUploadStyles className="input__image">
      <input
        type="file"
        name={name}
        className="hidden-input"
        onChange={() => {}}
        {...rest}
      />
      {progress !== 0 && !image && <LoadingSpinner></LoadingSpinner>}
      {!image && progress === 0 && (
        <div className="input__image--empty">
          <img src="/img-upload.png" alt="upload-img" />
          <p>Choose photo</p>
        </div>
      )}
      {image && (
        <div className="input__image--uploaded">
          <Image src={image} fallback={thumbnailPlaceholder} />
          <button type="button" onClick={handleDeleteImage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
      {!image && (
        <div
          className="input__image-progress"
          style={{
            width: `${Math.ceil(progress)}%`,
          }}
        ></div>
      )}
    </ImageUploadStyles>
  );
};
ImageUpload.propTypes = {
  name: PropTypes.string,
  progress: PropTypes.number,
  image: PropTypes.string,
};
export default ImageUpload;
