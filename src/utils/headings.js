import { toSlug } from "./toSlug";

// Gives a post's h1-h3 headings ids so a table of contents can link to
// them, and lists them. Runs on already sanitized HTML. Ids are prefixed
// so a heading like "Cookie" can't clobber a DOM global (id="cookie").
export function addHeadingIds(html) {
  if (!html) return { html: "", headings: [] };
  const doc = new DOMParser().parseFromString(html, "text/html");
  const used = new Set();
  const headings = [];
  doc.body.querySelectorAll("h1, h2, h3").forEach((element) => {
    const text = element.textContent.trim();
    if (!text) return;
    const base = `h-${toSlug(text) || "section"}`;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    element.id = id;
    headings.push({ id, text, level: Number(element.tagName[1]) });
  });
  return { html: doc.body.innerHTML, headings };
}
