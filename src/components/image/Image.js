import React, { useState } from "react";
import PropTypes from "prop-types";

// <img> that swaps to `fallback` when the source is empty or fails to load,
// so dead links (e.g. the old Firebase Storage URLs) never show a broken icon.
const Image = ({ src, fallback, alt = "", ...rest }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const showFallback = !src || failedSrc === src;
  return (
    <img
      src={showFallback ? fallback : src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string,
  fallback: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export default Image;
