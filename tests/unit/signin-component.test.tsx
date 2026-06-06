import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/client", () => ({ signIn: vi.fn() }));

import { SignIn } from "@/auth/SignIn";
import * as client from "@/lib/client";

describe("SignIn component", () => {
  beforeEach(() => vi.clearAllMocks());

  test("renders email + password fields and a sign-in button", () => {
    render(<SignIn onResolved={vi.fn()} />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  });

  test("on 401, shows the generic error banner with request_id and does not resolve", async () => {
    vi.mocked(client.signIn).mockResolvedValue({
      status: 401,
      error: { request_id: "req-401" },
    } as never);
    const onResolved = vi.fn();
    render(<SignIn onResolved={onResolved} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Sign-in failed.");
    expect(alert.textContent).toContain("req-401");
    expect(onResolved).not.toHaveBeenCalled();
  });

  test("on success with one membership, resolves to auto-select", async () => {
    vi.mocked(client.signIn).mockResolvedValue({
      status: 200,
      data: { memberships: [{ tenant_id: "t1" }] },
    } as never);
    const onResolved = vi.fn();
    render(<SignIn onResolved={onResolved} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(onResolved).toHaveBeenCalledWith({ kind: "auto-select", tenantId: "t1" }),
    );
  });
});
