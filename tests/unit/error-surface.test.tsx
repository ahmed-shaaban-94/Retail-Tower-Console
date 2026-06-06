import { Banner } from "@/components/Banner";
import { InlineError } from "@/components/InlineError";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

/**
 * Error/notification surface (T011, FR-003-007/008, VD-4/VD-5).
 * Persistent banner (not toast); surfaces the backend request_id.
 * Plain Testing Library queries (no jest-dom — not an approved dep).
 */
describe("Banner", () => {
  test("renders the message and the backend request_id", () => {
    render(<Banner variant="danger" message="Sign-in failed." requestId="9f3c1a7e-4b22" />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Sign-in failed.");
    expect(alert.textContent).toContain("9f3c1a7e-4b22");
  });

  test("omits the request_id line when none is given", () => {
    render(<Banner variant="info" message="Heads up." />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Heads up.");
    expect(alert.textContent).not.toMatch(/request_id/i);
  });
});

describe("InlineError", () => {
  test("renders nothing when there is no error", () => {
    const { container } = render(<InlineError message={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders the field error text when present", () => {
    render(<InlineError message="Email is required." />);
    expect(screen.getByText("Email is required.")).toBeDefined();
  });
});
