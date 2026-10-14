import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { doc, getDocs, updateDoc, where, writeBatch } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import ProfileSettingsPage from "pages/manage/ProfileSettingsPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <ProfileSettingsPage />
      </ThemeProvider>
    </MemoryRouter>
  );

describe("ProfileSettingsPage", () => {
  let batch;

  beforeEach(() => {
    useAuthStore.setState({
      user: {
        uid: "u1",
        fullname: "Alice",
        username: "alice",
        description: "Old bio",
        avatar: "https://cdn/alice.jpg",
      },
      isAuthLoading: false,
    });
    doc.mockImplementation((db, ...path) => ({ path: path.join("/") }));
    updateDoc.mockResolvedValue();
    getDocs.mockResolvedValue({
      docs: [{ ref: { path: "posts/p1" } }, { ref: { path: "posts/p2" } }],
    });
    batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue() };
    writeBatch.mockReturnValue(batch);
  });

  it("starts from the current profile", () => {
    renderPage();

    expect(screen.getByLabelText("Full name")).toHaveValue("Alice");
    expect(screen.getByLabelText("Bio")).toHaveValue("Old bio");
    expect(
      screen.getByRole("button", { name: "View your public profile" })
    ).toBeInTheDocument();
  });

  it("saves only the fields users may change and syncs their posts", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "  Alice Nguyen " },
    });
    fireEvent.click(screen.getByText("Save profile"));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(updateDoc).toHaveBeenCalledWith(
      { path: "users/u1" },
      {
        fullname: "Alice Nguyen",
        description: "Old bio",
        avatar: "https://cdn/alice.jpg",
      }
    );
    expect(where).toHaveBeenCalledWith("user.id", "==", "u1");
    expect(batch.update).toHaveBeenCalledTimes(2);
    expect(batch.update).toHaveBeenCalledWith(
      { path: "posts/p1" },
      { "user.fullname": "Alice Nguyen", "user.avatar": "https://cdn/alice.jpg" }
    );
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it("requires a name", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("Save profile"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Please enter your name.")
    );
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("reports a failed save", async () => {
    updateDoc.mockRejectedValue(new Error("permission-denied"));
    renderPage();

    fireEvent.click(screen.getByText("Save profile"));

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });
});
