const uploadSegment = "/image/upload/";

// Asks Cloudinary for a resized copy in the best format the browser
// supports (f_auto: WebP/AVIF) at automatic quality, instead of the
// full-size original. Other URLs, and ones that already carry a
// transformation, are returned untouched.
export const cloudinaryUrl = (url, width) => {
  if (!url || !width || !url.startsWith("https://res.cloudinary.com/")) {
    return url;
  }
  const index = url.indexOf(uploadSegment);
  if (index < 0) return url;
  const rest = url.slice(index + uploadSegment.length);
  // A version ("v1712345678/") or a public id follows a plain upload URL;
  // anything else is already a transformation
  const firstSegment = rest.split("/")[0];
  if (rest.includes("/") && !/^v\d+$/.test(firstSegment)) return url;
  const transformation = `f_auto,q_auto,c_limit,w_${Math.round(width)}`;
  return `${url.slice(0, index + uploadSegment.length)}${transformation}/${rest}`;
};
