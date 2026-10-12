import { shortId } from "utils/shortId";

describe("shortId", () => {
  it("should shorten a long ID with ellipsis in the middle", () => {
    const id = "abc123def456";
    const result = shortId(id);

    expect(result).toBe("abc...456");
  });

  it("should take first 3 and last 3 characters", () => {
    const id = "ABCDEFGHIJK";
    const result = shortId(id);

    expect(result).toBe("ABC...IJK");
  });

  it("should work with exactly 6 characters", () => {
    const id = "abcdef";
    const result = shortId(id);

    expect(result).toBe("abc...def");
  });

  it("should handle UUID-like strings", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const result = shortId(uuid);

    expect(result).toBe("550...000");
  });
});
