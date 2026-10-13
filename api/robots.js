// GET /robots.txt (rewritten here by vercel.json). A function rather than
// a static file because the Sitemap line needs the absolute site URL.
import { siteUrl } from "./_lib/firestore.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res
    .status(200)
    .send(
      `User-agent: *\nDisallow: /manage/\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`
    );
}
