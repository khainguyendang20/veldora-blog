// Colors the code blocks inside `container`. highlight.js and its theme are
// only downloaded for posts that contain code.
export async function highlightCode(container) {
  const blocks = [...container.querySelectorAll("pre")].filter(
    (block) => !block.dataset.highlighted
  );
  if (!blocks.length) return;
  const [{ default: hljs }] = await Promise.all([
    import("highlight.js/lib/common"),
    import("highlight.js/styles/github-dark.css"),
  ]);
  blocks.forEach((block) => hljs.highlightElement(block));
}
