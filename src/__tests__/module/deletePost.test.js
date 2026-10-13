import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { deletePost } from "module/post/deletePost";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(),
}));

describe("deletePost", () => {
  it("removes the post's comments and likes before the post", async () => {
    const order = [];
    collection.mockImplementation((db, ...path) => path.join("/"));
    doc.mockImplementation((db, ...path) => path.join("/"));
    getDocs.mockImplementation(async (path) => ({
      docs: [{ ref: `${path}/a` }, { ref: `${path}/b` }],
    }));
    writeBatch.mockImplementation(() => ({
      delete: (ref) => order.push(`delete ${ref}`),
      commit: async () => order.push("commit"),
    }));
    deleteDoc.mockImplementation(async (ref) => order.push(`delete ${ref}`));

    await deletePost("p1");

    expect(order).toEqual([
      "delete posts/p1/comments/a",
      "delete posts/p1/comments/b",
      "commit",
      "delete posts/p1/likes/a",
      "delete posts/p1/likes/b",
      "commit",
      "delete posts/p1",
    ]);
  });
});
