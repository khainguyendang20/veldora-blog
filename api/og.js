// GET /post/:slug for link-preview crawlers (vercel.json routes them here
// by user agent): a page with the post's title, summary and cover as Open
// Graph tags, which the app can't provide since crawlers skip JavaScript.
import { buildPreviewPage } from "./_lib/feeds.js";
import { getDb, siteUrl } from "./_lib/firestore.js";

export default async function handler(req, res) {
  const slug = String(req.query.slug || "");
  try {
    const snapshot = slug
      ? await getDb()
          .collection("posts")
          .where("slug", "==", slug)
          .where("status", "==", 1)
          .limit(1)
          .get()
      : null;
    const post = snapshot?.docs[0]?.data();
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(post ? 200 : 404).send(buildPreviewPage(siteUrl(req), post));
  } catch (error) {
    console.error(error);
    res.status(500).send(buildPreviewPage(siteUrl(req), null));
  }
}
