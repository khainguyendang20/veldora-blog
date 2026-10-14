import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import handler from "../../../api/cron/publish-scheduled";

vi.mock("firebase-admin/app", () => ({
  cert: vi.fn(),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));
vi.mock("firebase-admin/firestore", () => ({ getFirestore: vi.fn() }));

const fakeRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

describe("publish-scheduled cron", () => {
  let batch;
  let calls;

  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    getApps.mockReturnValue([{}]);
    calls = [];
    batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue() };
    const publishAt = new Date("2026-10-01T08:00:00Z");
    const q = {
      where: (...args) => {
        calls.push(args);
        return q;
      },
      get: async () => ({
        size: 1,
        docs: [{ ref: "posts/p1", data: () => ({ publishAt }) }],
      }),
    };
    getFirestore.mockReturnValue({ collection: () => q, batch: () => batch });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("refuses calls without the cron secret", async () => {
    const res = fakeRes();

    await handler({ headers: {} }, res);

    expect(res.statusCode).toBe(401);
    expect(batch.update).not.toHaveBeenCalled();
  });

  it("publishes due posts dated to their scheduled time", async () => {
    const res = fakeRes();

    await handler({ headers: { authorization: "Bearer s3cret" } }, res);

    expect(calls[0]).toEqual(["status", "==", 5]);
    expect(calls[1][0]).toBe("publishAt");
    expect(calls[1][1]).toBe("<=");
    expect(batch.update).toHaveBeenCalledWith("posts/p1", {
      status: 1,
      createdAt: new Date("2026-10-01T08:00:00Z"),
    });
    expect(res.body).toEqual({ published: 1 });
  });
});
