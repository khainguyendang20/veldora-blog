// Pure builders for sitemap.xml, rss.xml and the social preview page, kept
// apart from the handlers so they can be tested without Firestore.

export const siteName = "Veldora Blog";
export const siteDescription =
  "Veldora Blog: articles on technology and more.";

export const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Firestore Timestamp (Admin SDK) or anything Date accepts
const toDate = (value) =>
  value?.toDate ? value.toDate() : value ? new Date(value) : null;

export const buildSitemap = (base, posts, categories) => {
  const urls = [
    { loc: `${base}/` },
    { loc: `${base}/blog` },
    ...categories.map((category) => ({
      loc: `${base}/category/${category.slug}`,
    })),
    ...posts.map((post) => ({
      loc: `${base}/post/${post.slug}`,
      lastmod: toDate(post.createdAt)?.toISOString(),
    })),
  ];
  const entries = urls
    .map(
      ({ loc, lastmod }) =>
        `  <url><loc>${escapeXml(loc)}</loc>${
          lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
        }</url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
};

export const buildRss = (base, posts) => {
  const items = posts
    .map((post) => {
      const link = `${base}/post/${post.slug}`;
      const date = toDate(post.createdAt);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.desc || "")}</description>${
        post.user?.fullname
          ? `\n      <dc:creator>${escapeXml(post.user.fullname)}</dc:creator>`
          : ""
      }${date ? `\n      <pubDate>${date.toUTCString()}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(`${base}/`)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
};

// Cloudinary crops to the 1200x630 size link previews expect; other
// images are passed through
export const previewImage = (url) => {
  const marker = "/image/upload/";
  if (!url?.startsWith("https://res.cloudinary.com/") || !url.includes(marker)) {
    return url || "";
  }
  return url.replace(marker, `${marker}c_fill,w_1200,h_630,f_jpg,q_auto/`);
};

// Minimal page for link-preview crawlers (Facebook, Zalo, Slack…), which
// don't run JavaScript. Only crawler user agents are routed here
// (vercel.json); it has no redirect, which some crawlers would follow back
// to the same URL.
export const buildPreviewPage = (base, post) => {
  const url = post ? `${base}/post/${post.slug}` : `${base}/`;
  const title = post ? `${post.title} | ${siteName}` : siteName;
  const description = post?.desc || siteDescription;
  const image = previewImage(post?.thumbnail);
  const meta = [
    ["og:type", post ? "article" : "website"],
    ["og:site_name", siteName],
    ["og:title", post?.title || siteName],
    ["og:description", description],
    ["og:url", url],
    image && ["og:image", image],
  ]
    .filter(Boolean)
    .map(
      ([property, content]) =>
        `    <meta property="${property}" content="${escapeXml(content)}" />`
    )
    .join("\n");
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${escapeXml(title)}</title>
    <meta name="description" content="${escapeXml(description)}" />
    <link rel="canonical" href="${escapeXml(url)}" />
${meta}
    <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
  </head>
  <body>
    <a href="${escapeXml(url)}">${escapeXml(post?.title || siteName)}</a>
  </body>
</html>
`;
};
