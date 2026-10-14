import React, { useState } from "react";
import PropTypes from "prop-types";
import { cloudinaryUrl } from "utils/cloudinaryUrl";

// <img> that swaps to `fallback` when the source is empty or fails to load,
// so dead links (e.g. the old Firebase Storage URLs) never show a broken icon.
// `resizeTo` (CSS pixels, roughly twice the displayed width for sharp
// screens) asks Cloudinary for a smaller copy instead of the original.
const Image = ({ src, fallback, resizeTo, alt = "", ...rest }) => {
  const url = cloudinaryUrl(src, resizeTo);
  const [failedSrc, setFailedSrc] = useState(null);
  const showFallback = !url || failedSrc === url;
  if (showFallback && !fallback) return null;
  return (
    <img
      src={showFallback ? fallback : url}
      alt={alt}
      onError={() => setFailedSrc(url)}
      {...rest}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string,
  fallback: PropTypes.string,
  resizeTo: PropTypes.number,
  alt: PropTypes.string,
};

export default Image;
