import { doc } from "firebase/firestore";
import {
  addCommentNotification,
  addLikeNotification,
  removeCommentNotification,
  removeLikeNotification,
} from "module/notification/notify";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => "now"),
}));

const post = { id: "p1", slug: "hello", title: "Hello", user: { id: "author" } };
const reader = { uid: "r1", fullname: "Reader", username: "reader", avatar: "a.png" };

describe("notify", () => {
  let batch;

  beforeEach(() => {
    doc.mockImplementation((db, ...path) => path.join("/"));
    batch = { set: vi.fn(), delete: vi.fn() };
  });

  it("tells the author about a like under a fixed id", () => {
    addLikeNotification(batch, post, reader);

    expect(batch.set).toHaveBeenCalledWith(
      "users/author/notifications/like_p1_r1",
      expect.objectContaining({
        type: "like",
        postId: "p1",
        postSlug: "hello",
        read: false,
        actor: { id: "r1", fullname: "Reader", username: "reader", avatar: "a.png" },
      })
    );
  });

  it("withdraws the like notification on unlike", () => {
    removeLikeNotification(batch, post, "r1");

    expect(batch.delete).toHaveBeenCalledWith("users/author/notifications/like_p1_r1");
  });

  it("tells the author about a comment", () => {
    addCommentNotification(batch, post, reader, "c9");

    expect(batch.set).toHaveBeenCalledWith(
      "users/author/notifications/comment_c9",
      expect.objectContaining({ type: "comment", commentId: "c9" })
    );
  });

  it("withdraws a comment notification with the comment", () => {
    removeCommentNotification(batch, post, { id: "c9", user: { id: "r1" } });

    expect(batch.delete).toHaveBeenCalledWith("users/author/notifications/comment_c9");
  });

  it("never notifies authors about their own activity", () => {
    const author = { ...reader, uid: "author" };
    addLikeNotification(batch, post, author);
    addCommentNotification(batch, post, author, "c1");
    removeCommentNotification(batch, post, { id: "c1", user: { id: "author" } });

    expect(batch.set).not.toHaveBeenCalled();
    expect(batch.delete).not.toHaveBeenCalled();
  });
});
