import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import Textarea from "./TextArea";

describe("Textarea component", () => {
  it("renders textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<Textarea placeholder="Enter message" />);
    expect(
      screen.getByPlaceholderText("Enter message")
    ).toBeInTheDocument();
  });

  it("renders with default rows", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "3");
  });

  it("renders with custom rows", () => {
    render(<Textarea rows={5} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("renders with value", () => {
    render(<Textarea value="Hello world" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Hello world");
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "New text" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies textarea sizing styles", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");

    expect(textarea.className).toContain("min-h-24");
    expect(textarea.className).toContain("resize-y");
  });

  it("sets aria-invalid when error variant styles are requested", () => {
    render(<Textarea error="Invalid text" />);
    const textarea = screen.getByRole("textbox");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Invalid text")).toBeInTheDocument();
  });

  it("applies size styles correctly", () => {
    const { rerender, container } = render(<Textarea size="sm" />);
    expect(container.querySelector(".px-3")).toBeInTheDocument();

    rerender(<Textarea size="lg" />);
    expect(container.querySelector(".py-3")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");

    expect(textarea).toBeDisabled();
    expect(textarea.closest(".cursor-not-allowed")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Textarea className="custom-class" />);
    const textarea = screen.getByRole("textbox");

    expect(textarea).toBeInTheDocument();
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("does not throw if onChange is not provided", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");

    expect(() => {
      fireEvent.change(textarea, {
        target: { value: "Safe change" },
      });
    }).not.toThrow();
  });
});
