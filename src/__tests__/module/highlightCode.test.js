import { highlightCode } from "module/post/highlightCode";

describe("highlightCode", () => {
  it("colors code blocks", async () => {
    const container = document.createElement("div");
    container.innerHTML = '<pre class="ql-syntax">const answer = 42;</pre>';

    await highlightCode(container);

    const block = container.querySelector("pre");
    // The language is auto-detected, so only check that it was colored
    expect(block).toHaveClass("hljs");
    expect(block.querySelector("[class^='hljs-']")).not.toBeNull();
  });

  it("does nothing without code", async () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>No code here</p>";

    await highlightCode(container);

    expect(container.innerHTML).toBe("<p>No code here</p>");
  });
});
