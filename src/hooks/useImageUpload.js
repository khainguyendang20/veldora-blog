import { useState } from "react";
import { toast } from "react-toastify";
import { deleteImageByToken, uploadImage } from "utils/uploadImage";

export default function useImageUpload(onDeleted = null) {
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState("");
  const [deleteToken, setDeleteToken] = useState(null);

  const handleSelectImage = async (e) => {
    const file = e.target.files[0];
    // Let the same file be picked again after it is removed
    e.target.value = "";
    if (!file) return;
    try {
      const uploaded = await uploadImage(file, setProgress);
      setImage(uploaded.url);
      setDeleteToken(uploaded.deleteToken || null);
    } catch (error) {
      setProgress(0);
      toast.error("Upload image failed, please try again!");
    }
  };

  const handleResetUpload = () => {
    setImage("");
    setProgress(0);
    setDeleteToken(null);
  };

  // Images uploaded in this session are deleted from Cloudinary; older ones
  // are only unlinked from the post (see deleteImageByToken).
  const handleDeleteImage = async () => {
    if (deleteToken) {
      try {
        await deleteImageByToken(deleteToken);
      } catch (error) {
        // An expired token leaves an orphaned file, not a broken post
      }
    }
    handleResetUpload();
    onDeleted && onDeleted();
  };

  return {
    image,
    setImage,
    handleResetUpload,
    progress,
    handleSelectImage,
    handleDeleteImage,
  };
}
