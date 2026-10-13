import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Image from "components/image/Image";

describe("Image", () => {
  it("renders the given source", () => {
    render(<Image src="https://cdn/x.jpg" fallback="/fallback.svg" alt="cover" />);

    expect(screen.getByAltText("cover")).toHaveAttribute("src", "https://cdn/x.jpg");
  });

  it("switches to the fallback when the source fails to load", () => {
    render(<Image src="https://broken/x.jpg" fallback="/fallback.svg" alt="cover" />);
    const img = screen.getByAltText("cover");

    fireEvent.error(img);

    expect(img).toHaveAttribute("src", "/fallback.svg");
  });

  it("uses the fallback when there is no source", () => {
    render(<Image src="" fallback="/fallback.svg" alt="cover" />);

    expect(screen.getByAltText("cover")).toHaveAttribute("src", "/fallback.svg");
  });

  it("tries a new source again after a previous one failed", () => {
    const { rerender } = render(
      <Image src="https://broken/x.jpg" fallback="/fallback.svg" alt="cover" />
    );
    fireEvent.error(screen.getByAltText("cover"));

    rerender(<Image src="https://cdn/y.jpg" fallback="/fallback.svg" alt="cover" />);

    expect(screen.getByAltText("cover")).toHaveAttribute("src", "https://cdn/y.jpg");
  });
});

describe("Image resizing", () => {
  it("requests a resized Cloudinary copy", () => {
    render(
      <Image
        src="https://res.cloudinary.com/demo/image/upload/v1/a.jpg"
        fallback="/fallback.svg"
        resizeTo={400}
        alt="cover"
      />
    );

    expect(screen.getByAltText("cover")).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_400/v1/a.jpg"
    );
  });
});
