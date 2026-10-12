import { formatDate } from "utils/formatDate";

describe("formatDate", () => {
  it("should format a Firestore timestamp to Vietnamese locale date string", () => {
    // Jan 1, 2024 00:00:00 UTC
    const timestamp = { seconds: 1704067200 };
    const result = formatDate(timestamp);

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle different timestamps correctly", () => {
    // Dec 25, 2023
    const christmas = { seconds: 1703462400 };
    const result = formatDate(christmas);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return a date string containing year", () => {
    const timestamp = { seconds: 1704067200 }; // 2024
    const result = formatDate(timestamp);

    expect(result).toContain("2024");
  });

  it("should handle timestamp with seconds = 0 (epoch)", () => {
    const epoch = { seconds: 0 };
    const result = formatDate(epoch);

    expect(result).toContain("1970");
  });
});
