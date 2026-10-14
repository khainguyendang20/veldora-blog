import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import AddNewPostPage from "pages/manage/AddNewPostPage";
import UpdatePostPage from "pages/manage/UpdatePostPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
// Quill needs a real browser selection API; a textarea stands in for it.
vi.mock("react-quill", () => {
  const Editor = ({ value, onChange }) => (
    <textarea
      aria-label="content"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
  Editor.Quill = { register: () => {} };
  return { __esModule: true, default: Editor, Quill: Editor.Quill };
});
vi.mock("quill-image-uploader", () => ({ default: {} }));
// Image upload is covered by useImageUpload.test.js.
const mockImageHook = vi.hoisted(() => ({
  image: "https://img/thumb.jpg",
  setImage: () => {},
  progress: 0,
  handleSelectImage: () => {},
  handleDeleteImage: () => {},
  handleResetUpload: () => {},
}));
vi.mock("hooks/useImageUpload", () => ({ default: () => mockImageHook }));

const docs = {
  "posts/p1": {
    title: "Old title",
    slug: "old-title",
    status: 1,
    featured: false,
    content: "<p>Body</p>",
    thumbnail: "https://img/thumb.jpg",
    categories: [{ id: "c1", name: "Tech", slug: "tech", status: 1 }],
    user: { id: "u1", fullname: "Author" },
    likeCount: 5,
    commentCount: 2,
    lastCommentId: "c9",
  },
  "categories/c1": { name: "Tech", slug: "tech", status: 1 },
};

const snapshotOf = (items) => {
  const docs = items.map(([id, data]) => ({ id, data: () => data }));
  return { docs, forEach: (cb) => docs.forEach(cb) };
};

// Posts (by id) that the slug check finds, whatever the slug asked for
let postsWithSlug = [];

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/manage/add-post" element={<AddNewPostPage />} />
        <Route path="/manage/update-post" element={<UpdatePostPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  useAuthStore.setState({
    user: {
      uid: "u1",
      email: "a@b.c",
      role: 1,
      fullname: "Author",
      username: "author",
      avatar: "/a.png",
      password: "secret",
    },
    isAuthLoading: false,
  });
  collection.mockImplementation((db, name) => ({ name }));
  query.mockImplementation((col) => col);
  doc.mockImplementation((db, ...segments) => ({ path: segments.join("/") }));
  getDoc.mockImplementation(async (ref) => ({ data: () => docs[ref.path] }));
  postsWithSlug = [];
  getDocs.mockImplementation(async (q) =>
    q.name === "posts"
      ? snapshotOf(postsWithSlug.map((id) => [id, {}]))
      : snapshotOf([["c1", docs["categories/c1"]]])
  );
  addDoc.mockResolvedValue({ id: "new" });
  updateDoc.mockResolvedValue();
});

describe("UpdatePostPage", () => {
  it("saves the edited post with category ids", async () => {
    renderAt("/manage/update-post?id=p1");
    const title = await screen.findByDisplayValue("Old title");

    fireEvent.change(title, { target: { value: "New title" } });
    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Update Post"));

    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    const [ref, payload] = updateDoc.mock.calls[0];
    expect(ref).toEqual({ path: "posts/p1" });
    expect(payload).toMatchObject({
      title: "New title",
      slug: "new-title",
      status: 1,
      content: "<p>Body</p>",
      thumbnail: "https://img/thumb.jpg",
      categories: [{ id: "c1", name: "Tech", slug: "tech", status: 1 }],
      categoryIds: ["c1"],
    });
    expect(toast.success).toHaveBeenCalledWith("Update post successfully!");
    // Stale counters from when the form loaded must not overwrite new ones
    expect(payload).not.toHaveProperty("likeCount");
    expect(payload).not.toHaveProperty("commentCount");
    expect(payload).not.toHaveProperty("lastCommentId");
  });
});

describe("AddNewPostPage", () => {
  it("creates a post with a generated slug, author and category ids", async () => {
    renderAt("/manage/add-post");
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Hello World" },
    });
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    const [, payload] = addDoc.mock.calls[0];
    expect(payload).toMatchObject({
      title: "Hello World",
      slug: "hello-world",
      status: 2,
      thumbnail: "https://img/thumb.jpg",
      categories: [],
      categoryIds: [],
    });
    // Only public profile fields are copied into the public post
    expect(payload.user).toEqual({
      id: "u1",
      fullname: "Author",
      username: "author",
      avatar: "/a.png",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Create new post successfully!"
    );
  });
});

describe("as a regular user", () => {
  const setRegularUser = (uid) =>
    useAuthStore.setState({
      user: { uid, email: "r@b.c", role: 3, fullname: "Reader" },
      isAuthLoading: false,
    });

  it("hides moderation controls and submits the post for review", async () => {
    setRegularUser("u2");
    renderAt("/manage/add-post");
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
    expect(screen.queryByText("Featured Post:")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Draft" },
    });
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    expect(addDoc.mock.calls[0][1]).toMatchObject({
      status: 2,
      featured: false,
      user: { id: "u2" },
    });
  });

  it("can edit their own post", async () => {
    setRegularUser("u1");
    renderAt("/manage/update-post?id=p1");

    expect(await screen.findByDisplayValue("Old title")).toBeInTheDocument();
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
  });

  it("cannot edit someone else's post", async () => {
    setRegularUser("u2");
    renderAt("/manage/update-post?id=p1");

    expect(await screen.findByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Old title")).not.toBeInTheDocument();
  });

  it("is denied when Firestore refuses to return the post", async () => {
    setRegularUser("u2");
    getDoc.mockRejectedValue(new Error("permission-denied"));
    renderAt("/manage/update-post?id=p1");

    expect(await screen.findByText("Access Denied")).toBeInTheDocument();
  });
});

describe("slug uniqueness", () => {
  it("keeps an edited post's own slug", async () => {
    postsWithSlug = ["p1"];
    renderAt("/manage/update-post?id=p1");
    await screen.findByDisplayValue("Old title");

    fireEvent.click(screen.getByText("Update Post"));

    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    expect(updateDoc.mock.calls[0][1].slug).toBe("old-title");
  });

  it("adds a suffix when the title's slug is taken", async () => {
    postsWithSlug = ["other"];
    renderAt("/manage/add-post");
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Hello World" },
    });
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    expect(addDoc.mock.calls[0][1].slug).toMatch(/^hello-world-[a-z0-9]{1,4}$/);
  });

  it("asks for another slug when a typed one is taken", async () => {
    postsWithSlug = ["other"];
    renderAt("/manage/add-post");
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByLabelText("Slug"), {
      target: { value: "my-slug" },
    });
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This slug is already used by another post."
      )
    );
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("checks only posts a regular user may read", async () => {
    useAuthStore.setState({
      user: { uid: "u2", role: 3, fullname: "Reader" },
      isAuthLoading: false,
    });
    renderAt("/manage/add-post");
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    expect(where).toHaveBeenCalledWith("status", "==", 1);
    expect(where).toHaveBeenCalledWith("user.id", "==", "u2");
  });
});

describe("drafts, scheduling and autosave", () => {
  const setRole = (role) =>
    useAuthStore.setState({
      user: { uid: "u2", email: "r@b.c", role, fullname: "Writer" },
      isAuthLoading: false,
    });

  const startPost = async () => {
    renderAt("/manage/add-post");
    await waitFor(() => expect(getDocs).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Hello" },
    });
  };

  it("lets authors keep a post as a draft", async () => {
    setRole(3);
    await startPost();

    fireEvent.click(screen.getByLabelText("Draft"));
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    expect(addDoc.mock.calls[0][1]).toMatchObject({ status: 4 });
    expect(screen.queryByLabelText("Scheduled")).not.toBeInTheDocument();
  });

  it("shows authors a published post's status without letting them change it", async () => {
    setRole(3);
    useAuthStore.setState({
      user: { uid: "u1", email: "a@b.c", role: 3, fullname: "Author" },
      isAuthLoading: false,
    });
    renderAt("/manage/update-post?id=p1");

    expect(await screen.findByText("Published")).toBeInTheDocument();
    expect(screen.queryByLabelText("Draft")).not.toBeInTheDocument();
  });

  it("asks staff for a time before scheduling", async () => {
    setRole(1);
    await startPost();

    fireEvent.click(screen.getByLabelText("Scheduled"));
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Pick when the post should be published."
      )
    );
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("schedules a post for the chosen time", async () => {
    setRole(1);
    await startPost();

    fireEvent.click(screen.getByLabelText("Scheduled"));
    fireEvent.change(screen.getByLabelText("Publish at"), {
      target: { value: "2026-12-01T08:30" },
    });
    fireEvent.click(screen.getByText("Create Post"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    const payload = addDoc.mock.calls[0][1];
    expect(payload.status).toBe(5);
    expect(payload.publishAt).toEqual(new Date("2026-12-01T08:30"));
  });

  it("offers to restore unsaved text from an earlier visit", async () => {
    setRole(3);
    localStorage.setItem(
      "autosave:new-post",
      JSON.stringify({
        values: { title: "Unsaved title", slug: "", desc: "", content: "<p>x</p>" },
        savedAt: Date.now(),
      })
    );
    renderAt("/manage/add-post");

    fireEvent.click(await screen.findByRole("button", { name: "Restore" }));

    expect(screen.getByPlaceholderText("Title")).toHaveValue("Unsaved title");
    expect(screen.queryByRole("button", { name: "Restore" })).not.toBeInTheDocument();
  });
});
