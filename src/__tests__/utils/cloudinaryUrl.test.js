import { cloudinaryUrl } from "utils/cloudinaryUrl";

const base = "https://res.cloudinary.com/demo/image/upload";

describe("cloudinaryUrl", () => {
  it("adds a resize and auto format/quality transformation", () => {
    expect(cloudinaryUrl(`${base}/v1712345678/assets/abc.jpg`, 800)).toBe(
      `${base}/f_auto,q_auto,c_limit,w_800/v1712345678/assets/abc.jpg`
    );
  });

  it("handles URLs without a version", () => {
    expect(cloudinaryUrl(`${base}/abc.jpg`, 160)).toBe(
      `${base}/f_auto,q_auto,c_limit,w_160/abc.jpg`
    );
  });

  it("leaves an existing transformation alone", () => {
    const url = `${base}/w_300/v1/abc.jpg`;
    expect(cloudinaryUrl(url, 800)).toBe(url);
  });

  it("leaves other hosts and empty values alone", () => {
    const firebase = "https://firebasestorage.googleapis.com/v0/b/x/o/a.jpg";
    expect(cloudinaryUrl(firebase, 800)).toBe(firebase);
    expect(cloudinaryUrl("/avatar-default.svg", 160)).toBe("/avatar-default.svg");
    expect(cloudinaryUrl("", 800)).toBe("");
    expect(cloudinaryUrl(undefined, 800)).toBeUndefined();
  });
});
