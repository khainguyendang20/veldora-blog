import slugify from "slugify";
import { normalizeText } from "./normalizeText";

// URL slug for Vietnamese text. slugify alone turns "đ" into "dj" (its
// Serbian transliteration), so "Đà Lạt" became "dja-lat"; strip the
// diacritics first. strict drops anything that isn't a letter or digit.
export const toSlug = (text) =>
  slugify(normalizeText(text), { lower: true, strict: true });
