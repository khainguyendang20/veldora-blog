import axios from "axios";
import { deleteImageByToken, uploadImage } from "utils/uploadImage";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));

beforeEach(() => {
  vi.stubEnv("REACT_APP_CLOUDINARY_CLOUD_NAME", "demo-cloud");
  vi.stubEnv("REACT_APP_CLOUDINARY_UPLOAD_PRESET", "blog-preset");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("uploadImage", () => {
  it("posts the file with the unsigned preset and returns the hosted URL", async () => {
    axios.post.mockResolvedValue({
      data: { secure_url: "https://res.cloudinary.com/x.jpg", delete_token: "t1" },
    });
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    const result = await uploadImage(file);

    const [url, body] = axios.post.mock.calls[0];
    expect(url).toBe("https://api.cloudinary.com/v1_1/demo-cloud/image/upload");
    expect(body.get("file")).toBe(file);
    expect(body.get("upload_preset")).toBe("blog-preset");
    // Cloudinary generates a unique public_id, so same-named files never collide
    expect(body.has("public_id")).toBe(false);
    expect(result).toEqual({
      url: "https://res.cloudinary.com/x.jpg",
      deleteToken: "t1",
    });
  });

  it("reports upload progress as a percentage", async () => {
    axios.post.mockImplementation(async (url, body, config) => {
      config.onUploadProgress({ loaded: 25, total: 100 });
      return { data: { secure_url: "u" } };
    });
    const onProgress = vi.fn();

    await uploadImage(new File(["data"], "a.png"), onProgress);

    expect(onProgress).toHaveBeenCalledWith(25);
  });
});

describe("deleteImageByToken", () => {
  it("posts the delete token to Cloudinary", async () => {
    axios.post.mockResolvedValue({});

    await deleteImageByToken("t1");

    expect(axios.post).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/demo-cloud/delete_by_token",
      { token: "t1" }
    );
  });
});
