// Lowercases and strips Vietnamese diacritics so "cong nghe" matches
// "Công nghệ". "đ" is a separate letter, not a combining mark, so it needs
// its own replacement.
export const normalizeText = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
