// Average adult reading speed; Vietnamese is counted per syllable, which
// reads at a similar pace
const wordsPerMinute = 220;

// Minutes to read a post's HTML content, at least 1
export const readingTime = (html) => {
  const text = String(html ?? "").replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};
