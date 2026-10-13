import { toSlug } from "utils/toSlug";

describe("toSlug", () => {
  it("turns Vietnamese titles into readable slugs", () => {
    expect(toSlug("Đà Lạt mùa hoa dã quỳ")).toBe("da-lat-mua-hoa-da-quy");
    expect(toSlug("Cài đặt React 18!")).toBe("cai-dat-react-18");
  });

  it("drops punctuation", () => {
    expect(toSlug("What's new? (2026)")).toBe("whats-new-2026");
  });
});
