import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import AddNewCategoryPage from "pages/manage/AddNewCategoryPage";
import EditCategoryPage from "pages/manage/EditCategoryPage";

jest.mock("config/firebase-config", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/manage/add-category" element={<AddNewCategoryPage />} />
        <Route path="/manage/edit-category" element={<EditCategoryPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  useAuthStore.setState({ user: { uid: "u1", role: 1 }, isAuthLoading: false });
  collection.mockImplementation((db, name) => ({ name }));
  doc.mockImplementation((db, ...segments) => ({ path: segments.join("/") }));
  getDoc.mockResolvedValue({
    data: () => ({ name: "Tech", slug: "tech", status: 0 }),
  });
  addDoc.mockResolvedValue({ id: "new" });
  updateDoc.mockResolvedValue();
});

describe("EditCategoryPage", () => {
  it("saves status as a number and confirms the update", async () => {
    renderAt("/manage/edit-category?id=c1");
    await screen.findByDisplayValue("Tech");

    fireEvent.click(screen.getByText("Approved"));
    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    const [ref, payload] = updateDoc.mock.calls[0];
    expect(ref).toEqual({ path: "categories/c1" });
    expect(payload).toMatchObject({ name: "Tech", slug: "tech", status: 1 });
    expect(toast.success).toHaveBeenCalledWith(
      "Update category successfully!"
    );
  });
});

describe("AddNewCategoryPage", () => {
  it("creates an unapproved category with a generated slug", async () => {
    renderAt("/manage/add-category");

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Hello World" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    const [ref, payload] = addDoc.mock.calls[0];
    expect(ref).toEqual({ name: "categories" });
    expect(payload).toMatchObject({
      name: "Hello World",
      slug: "hello-world",
      status: 0,
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Create new category successfully!"
    );
  });
});
