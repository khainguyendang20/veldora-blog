import {
  buildPreviewPage,
  buildRss,
  buildSitemap,
  escapeXml,
  previewImage,
} from "../../../api/_lib/feeds";

const base = "https://blog.example";
const createdAt = { toDate: () => new Date("2026-01-02T03:04:05Z") };
const post = {
  title: "Tips & <tricks>",
  slug: "tips",
  desc: 'Say "hi"',
  createdAt,
  user: { fullname: "Lan" },
  thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
};

describe("feeds", () => {
  it("escapes XML special characters", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;"
    );
  });

  it("lists home, blog, categories and posts in the sitemap", () => {
    const xml = buildSitemap(base, [post], [{ slug: "tech" }]);

    expect(xml).toContain("<loc>https://blog.example/</loc>");
    expect(xml).toContain("<loc>https://blog.example/category/tech</loc>");
    expect(xml).toContain(
      "<url><loc>https://blog.example/post/tips</loc><lastmod>2026-01-02T03:04:05.000Z</lastmod></url>"
    );
  });

  it("builds an RSS item per post with escaped text", () => {
    const xml = buildRss(base, [post]);

    expect(xml).toContain("<title>Tips &amp; &lt;tricks&gt;</title>");
    expect(xml).toContain("<link>https://blog.example/post/tips</link>");
    expect(xml).toContain("<dc:creator>Lan</dc:creator>");
    expect(xml).toContain("<pubDate>Fri, 02 Jan 2026 03:04:05 GMT</pubDate>");
  });

  it("crops Cloudinary covers to the preview size", () => {
    expect(previewImage(post.thumbnail)).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_630,f_jpg,q_auto/v1/a.jpg"
    );
    expect(previewImage("https://other/a.jpg")).toBe("https://other/a.jpg");
    expect(previewImage(undefined)).toBe("");
  });

  it("gives crawlers the post's Open Graph tags", () => {
    const html = buildPreviewPage(base, post);

    expect(html).toContain(
      '<meta property="og:title" content="Tips &amp; &lt;tricks&gt;" />'
    );
    expect(html).toContain(
      '<meta property="og:url" content="https://blog.example/post/tips" />'
    );
    expect(html).toContain('property="og:image"');
    expect(html).toContain('content="summary_large_image"');
    expect(html).not.toMatch(/http-equiv="refresh"/);
  });

  it("falls back to the site's own preview without a post", () => {
    const html = buildPreviewPage(base, null);

    expect(html).toContain("<title>Veldora Blog</title>");
    expect(html).not.toContain('property="og:image"');
  });
});
