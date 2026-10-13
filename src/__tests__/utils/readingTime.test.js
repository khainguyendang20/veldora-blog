import { readingTime } from "utils/readingTime";

const words = (n) => Array.from({ length: n }, () => "word").join(" ");

describe("readingTime", () => {
  it("counts words, not markup", () => {
    expect(readingTime(`<p>${words(440)}</p><img src="x.jpg">`)).toBe(2);
  });

  it("rounds up partial minutes", () => {
    expect(readingTime(words(221))).toBe(2);
  });

  it("is at least one minute", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime(undefined)).toBe(1);
  });
});
