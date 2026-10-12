import React, { useRef } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { useClickOutside } from "hooks/useClickOutSide";

// Test component that uses the hook
const TestComponent = ({ onClickOutside }) => {
  const ref = useRef(null);
  useClickOutside(ref, onClickOutside);

  return (
    <div>
      <div ref={ref} data-testid="inside">
        Inside
      </div>
      <div data-testid="outside">Outside</div>
    </div>
  );
};

describe("useClickOutside", () => {
  it("should call handler when clicking outside the ref element", () => {
    const handler = jest.fn();
    render(<TestComponent onClickOutside={handler} />);

    fireEvent.mouseDown(screen.getByTestId("outside"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should NOT call handler when clicking inside the ref element", () => {
    const handler = jest.fn();
    render(<TestComponent onClickOutside={handler} />);

    fireEvent.mouseDown(screen.getByTestId("inside"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("should handle touchstart events", () => {
    const handler = jest.fn();
    render(<TestComponent onClickOutside={handler} />);

    fireEvent.touchStart(screen.getByTestId("outside"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should clean up event listeners on unmount", () => {
    const handler = jest.fn();
    const { unmount } = render(
      <TestComponent onClickOutside={handler} />
    );

    unmount();

    fireEvent.mouseDown(document.body);

    expect(handler).not.toHaveBeenCalled();
  });
});
