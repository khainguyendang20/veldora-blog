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
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import AddNewPostPage from "pages/manage/AddNewPostPage";
import UpdatePostPage from "pages/manage/UpdatePostPage";

jest.mock("config/firebase-config", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
// Quill needs a real browser selection API; a textarea stands in for it.
jest.mock("react-quill", () => {
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
jest.mock("quill-image-uploader", () => ({}));
// Firebase Storage upload is out of scope for these tests.
const mockImageHook = {
  image: "https://img/thumb.jpg",
  setImage: () => {},
  progress: 0,
  handleSelectImage: () => {},
  handleDeleteImage: () => {},
  handleResetUpload: () => {},
};
jest.mock("hooks/useFireBaseImage", () => () => mockImageHook);

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
  },
  "categories/c1": { name: "Tech", slug: "tech", status: 1 },
};

const snapshotOf = (items) => ({
  forEach: (cb) => items.forEach(([id, data]) => cb({ id, data: () => data })),
});

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
    user: { uid: "u1", email: "a@b.c", role: 1 },
    isAuthLoading: false,
  });
  collection.mockImplementation((db, name) => ({ name }));
  query.mockImplementation((col) => col);
  doc.mockImplementation((db, ...segments) => ({ path: segments.join("/") }));
  getDoc.mockImplementation(async (ref) => ({ data: () => docs[ref.path] }));
  getDocs.mockImplementation(async (q) =>
    q.name === "users"
      ? snapshotOf([["u1", { fullname: "Author", email: "a@b.c" }]])
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
      user: { id: "u1", fullname: "Author", email: "a@b.c" },
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Create new post successfully!"
    );
  });
});
