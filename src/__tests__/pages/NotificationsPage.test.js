import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  doc,
  onSnapshot,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuthStore } from "store";
import { theme } from "utils/constants";
import NotificationsPage from "pages/manage/NotificationsPage";

vi.mock("config/firebase-config", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

const notifications = [
  {
    id: "n1",
    type: "like",
    postSlug: "hello",
    postTitle: "Hello",
    actor: { fullname: "Lan" },
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    postSlug: "world",
    postTitle: "World",
    actor: { fullname: "Minh" },
    read: true,
  },
];

describe("NotificationsPage", () => {
  let batch;

  beforeEach(() => {
    useAuthStore.setState({ user: { uid: "u1" }, isAuthLoading: false });
    query.mockReturnValue({});
    doc.mockImplementation((db, ...path) => path.join("/"));
    updateDoc.mockResolvedValue();
    batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue() };
    writeBatch.mockReturnValue(batch);
    onSnapshot.mockImplementation((q, cb) => {
      cb({
        forEach: (fn) => notifications.forEach((n) => fn({ id: n.id, data: () => n })),
      });
      return vi.fn();
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <NotificationsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

  it("describes each like and comment with a link to the post", () => {
    renderPage();

    expect(screen.getByText(/liked your post/)).toBeInTheDocument();
    expect(screen.getByText(/commented on your post/)).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/post/hello");
  });

  it("marks an unread notification read when opened", () => {
    renderPage();

    fireEvent.click(screen.getAllByRole("link")[0]);

    expect(updateDoc).toHaveBeenCalledWith("users/u1/notifications/n1", { read: true });
  });

  it("marks only the unread ones read at once", async () => {
    renderPage();

    fireEvent.click(screen.getByText("Mark all as read"));

    await waitFor(() => expect(batch.commit).toHaveBeenCalledTimes(1));
    expect(batch.update).toHaveBeenCalledTimes(1);
    expect(batch.update).toHaveBeenCalledWith("users/u1/notifications/n1", { read: true });
  });
});
