import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import useImageUpload from "hooks/useImageUpload";
import { deleteImageByToken, uploadImage } from "utils/uploadImage";

vi.mock("utils/uploadImage", () => ({
  uploadImage: vi.fn(),
  deleteImageByToken: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

const selectEvent = (file) => ({ target: { files: [file], value: "x" } });
const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

describe("useImageUpload", () => {
  it("stores the uploaded image URL", async () => {
    uploadImage.mockResolvedValue({ url: "https://cdn/x.jpg", deleteToken: "t1" });
    const { result } = renderHook(() => useImageUpload());

    await act(() => result.current.handleSelectImage(selectEvent(file)));

    expect(uploadImage).toHaveBeenCalledWith(file, expect.any(Function));
    expect(result.current.image).toBe("https://cdn/x.jpg");
  });

  it("shows an error and resets progress when the upload fails", async () => {
    uploadImage.mockImplementation(async (f, onProgress) => {
      onProgress(40);
      throw new Error("402");
    });
    const { result } = renderHook(() => useImageUpload());

    await act(() => result.current.handleSelectImage(selectEvent(file)));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(result.current.image).toBe("");
    expect(result.current.progress).toBe(0);
  });

  it("deletes a fresh upload with its token and notifies the caller", async () => {
    uploadImage.mockResolvedValue({ url: "https://cdn/x.jpg", deleteToken: "t1" });
    deleteImageByToken.mockResolvedValue();
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useImageUpload(onDeleted));
    await act(() => result.current.handleSelectImage(selectEvent(file)));

    await act(() => result.current.handleDeleteImage());

    expect(deleteImageByToken).toHaveBeenCalledWith("t1");
    expect(result.current.image).toBe("");
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it("unlinks an existing image even though it cannot be deleted remotely", async () => {
    const onDeleted = vi.fn();
    const { result } = renderHook(() => useImageUpload(onDeleted));
    act(() => result.current.setImage("https://cdn/old.jpg"));

    await act(() => result.current.handleDeleteImage());

    expect(deleteImageByToken).not.toHaveBeenCalled();
    expect(result.current.image).toBe("");
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
  });

  it("still unlinks the image when the remote delete fails", async () => {
    uploadImage.mockResolvedValue({ url: "https://cdn/x.jpg", deleteToken: "expired" });
    deleteImageByToken.mockRejectedValue(new Error("token expired"));
    const { result } = renderHook(() => useImageUpload());
    await act(() => result.current.handleSelectImage(selectEvent(file)));

    await act(() => result.current.handleDeleteImage());

    expect(result.current.image).toBe("");
  });
});
