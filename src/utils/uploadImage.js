import axios from "axios";

const apiUrl = () =>
  `https://api.cloudinary.com/v1_1/${import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`;

// Unsigned upload to Cloudinary. No public_id is sent, so Cloudinary
// generates a unique one and files with the same name never overwrite
// each other. `deleteToken` is only present when the upload preset has
// "Return delete token" enabled.
export async function uploadImage(file, onProgress) {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", import.meta.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  const response = await axios.post(`${apiUrl()}/image/upload`, body, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress((event.loaded / event.total) * 100);
    },
  });
  return {
    url: response.data.secure_url,
    deleteToken: response.data.delete_token,
  };
}

// Delete tokens expire 10 minutes after the upload; older images can only
// be deleted with the API secret, which must never reach the browser.
export function deleteImageByToken(token) {
  return axios.post(`${apiUrl()}/delete_by_token`, { token });
}
