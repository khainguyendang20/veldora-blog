const defaultLength = 160;

// Plain text from post HTML, entities decoded, whitespace collapsed
const textFromHtml = (html) => {
  if (!html) return "";
  // Space after each block so "<h2>Intro</h2><p>Body" reads "Intro Body"
  const spaced = html.replace(
    /<\/(p|h[1-6]|li|div|blockquote|pre)>|<br\s*\/?>/gi,
    "$& "
  );
  const doc = new DOMParser().parseFromString(spaced, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

// The start of `text`, cut at a word boundary
const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};

// A post's summary: its own description, or for posts written without
// one, the opening of its content
export const postSummary = (post, maxLength = defaultLength) => {
  const desc = (post?.desc || "").trim();
  if (desc) return desc;
  return truncate(textFromHtml(post?.content), maxLength);
};
