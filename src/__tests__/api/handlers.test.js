import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import ogHandler from "../../../api/og";
import robotsHandler from "../../../api/robots";
import sitemapHandler from "../../../api/sitemap";

vi.mock("firebase-admin/app", () => ({
  cert: vi.fn(),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));
vi.mock("firebase-admin/firestore", () => ({ getFirestore: vi.fn() }));

// A chainable stand-in for an Admin SDK query; records where() calls
const fakeQuery = (docs, calls = []) => {
  const q = {
    where: (...args) => {
      calls.push(args);
      return q;
    },
    orderBy: () => q,
    limit: () => q,
    select: () => q,
    get: async () => ({ docs: docs.map((data) => ({ data: () => data })) }),
  };
  return q;
};

const fakeRes = () => {
  const res = { headers: {} };
  res.setHeader = (key, value) => {
    res.headers[key] = value;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

const req = (query = {}) => ({
  query,
  headers: { host: "blog.example", "x-forwarded-proto": "https" },
});

describe("api handlers", () => {
  beforeEach(() => {
    // An app already exists, so no service account is needed
    getApps.mockReturnValue([{}]);
  });

  it("serves a cached sitemap of approved content", async () => {
    const calls = [];
    getFirestore.mockReturnValue({
      collection: (name) =>
        fakeQuery(name === "posts" ? [{ slug: "tips" }] : [{ slug: "tech" }], calls),
    });
    const res = fakeRes();

    await sitemapHandler(req(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("https://blog.example/post/tips");
    expect(res.headers["Cache-Control"]).toContain("s-maxage=3600");
    expect(calls).toContainEqual(["status", "==", 1]);
  });

  it("gives crawlers a 404 preview for an unknown post", async () => {
    getFirestore.mockReturnValue({ collection: () => fakeQuery([]) });
    const res = fakeRes();

    await ogHandler(req({ slug: "missing" }), res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toContain("<title>Veldora Blog</title>");
  });

  it("only previews approved posts", async () => {
    const calls = [];
    getFirestore.mockReturnValue({
      collection: () => fakeQuery([{ title: "Tips", slug: "tips" }], calls),
    });
    const res = fakeRes();

    await ogHandler(req({ slug: "tips" }), res);

    expect(res.statusCode).toBe(200);
    expect(calls).toEqual([
      ["slug", "==", "tips"],
      ["status", "==", 1],
    ]);
  });

  it("points robots at the absolute sitemap URL", () => {
    const res = fakeRes();

    robotsHandler(req(), res);

    expect(res.body).toContain("Sitemap: https://blog.example/sitemap.xml");
    expect(res.body).toContain("Disallow: /manage/");
  });
});
