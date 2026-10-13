// `createdAt` is null in the local snapshot until the server timestamp of
// a fresh write resolves, so tolerate a missing date
export const formatDate = (date) => {
  if (typeof date?.seconds !== "number") return "";
  return new Date(date.seconds * 1000).toLocaleDateString("vi-VI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
