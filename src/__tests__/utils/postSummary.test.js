import { postSummary } from "utils/postSummary";

describe("postSummary", () => {
  it("uses the post's own description", () => {
    expect(postSummary({ desc: "  Written by hand  ", content: "<p>Body</p>" })).toBe(
      "Written by hand"
    );
  });

  it("falls back to the opening of the content as plain text", () => {
    expect(
      postSummary({ desc: "", content: "<h2>Intro</h2><p>Tom &amp; Jerry   say hi.</p>" })
    ).toBe("Intro Tom & Jerry say hi.");
  });

  it("cuts long content at a word boundary", () => {
    const content = `<p>${"word ".repeat(60)}</p>`;
    const summary = postSummary({ content }, 40);

    expect(summary.endsWith("word…")).toBe(true);
    expect(summary.length).toBeLessThanOrEqual(41);
  });

  it("is empty when there is nothing to summarize", () => {
    expect(postSummary({})).toBe("");
    expect(postSummary(undefined)).toBe("");
  });
});
