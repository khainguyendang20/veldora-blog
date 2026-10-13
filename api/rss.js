// GET /rss.xml (rewritten here by vercel.json): the 20 newest posts
import { buildRss } from "./_lib/feeds.js";
import { approvedPosts, getDb, siteUrl } from "./_lib/firestore.js";

export default async function handler(req, res) {
  try {
    const posts = await approvedPosts(getDb(), 20)
      .select("title", "slug", "desc", "createdAt", "user.fullname")
      .get();
    const xml = buildRss(
      siteUrl(req),
      posts.docs.map((doc) => doc.data())
    );
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not build the feed.");
  }
}
