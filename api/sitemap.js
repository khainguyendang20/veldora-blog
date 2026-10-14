// GET /sitemap.xml (rewritten here by vercel.json)
import { buildSitemap } from "./_lib/feeds.js";
import { approvedPosts, getDb, siteUrl } from "./_lib/firestore.js";

export default async function handler(req, res) {
  try {
    const db = getDb();
    const [posts, categories] = await Promise.all([
      approvedPosts(db, 1000).select("slug", "createdAt").get(),
      db.collection("categories").where("status", "==", 1).select("slug").get(),
    ]);
    const xml = buildSitemap(
      siteUrl(req),
      posts.docs.map((doc) => doc.data()),
      categories.docs.map((doc) => doc.data())
    );
    // The CDN serves this for an hour, so crawlers cost almost no reads
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not build the sitemap.");
  }
}
