import { normalizeText } from "utils/normalizeText";

describe("normalizeText", () => {
  it("strips Vietnamese diacritics and lowercases", () => {
    expect(normalizeText("Công Nghệ")).toBe("cong nghe");
    expect(normalizeText("Hướng dẫn lập trình")).toBe("huong dan lap trinh");
  });

  it("maps đ and Đ to d", () => {
    expect(normalizeText("Đường đi")).toBe("duong di");
  });

  it("tolerates missing values", () => {
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText(null)).toBe("");
  });
});
