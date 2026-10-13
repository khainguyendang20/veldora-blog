import { renderHook } from "@testing-library/react";
import useDocumentMeta from "hooks/useDocumentMeta";

describe("useDocumentMeta", () => {
  let meta;

  beforeEach(() => {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "Default description");
    document.head.appendChild(meta);
  });

  afterEach(() => meta.remove());

  it("titles the page after its content", () => {
    renderHook(() => useDocumentMeta({ title: "Hello" }));

    expect(document.title).toBe("Hello | Veldora Blog");
  });

  it("uses the site name alone without a title", () => {
    renderHook(() => useDocumentMeta());

    expect(document.title).toBe("Veldora Blog");
  });

  it("sets the description and restores it on leave", () => {
    const { unmount } = renderHook(() =>
      useDocumentMeta({ title: "Hello", description: "About hello" })
    );
    expect(meta.getAttribute("content")).toBe("About hello");

    unmount();

    expect(meta.getAttribute("content")).toBe("Default description");
    expect(document.title).toBe("Veldora Blog");
  });
});
