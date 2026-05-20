import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "@app/layouts/Sidebar/Sidebar";
import type { User } from "@auth/types";

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@auth/slices", () => ({
  default: (state = {}) => state,
  authReducer: (state = {}) => state,
  serverLogout: () => ({ type: "auth/serverLogout" }),
}));

vi.mock("@app/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function setup(user: User) {
  return render(
    <MemoryRouter>
      <Sidebar user={user} />
    </MemoryRouter>,
  );
}

describe("Sidebar Component", () => {
  it("renders pharmacist navigation items", () => {
    setup({ role: "pharmacist" } as User);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Manual Prescription Entry")).toBeInTheDocument();
    expect(screen.getByText("Prescription Validation")).toBeInTheDocument();
    expect(screen.getByText("Patient Profiles")).toBeInTheDocument();
    expect(screen.getByText("Label Generator")).toBeInTheDocument();
    expect(screen.getByText("Prescription History")).toBeInTheDocument();
  });

  it("renders manager navigation items", () => {
    setup({ role: "manager" } as User);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Prescription Validation")).not.toBeInTheDocument();
  });

  it("renders technician navigation items", () => {
    setup({ role: "technician" } as User);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Inventory Management")).toBeInTheDocument();
  });

  it("toggles sidebar collapse state when clicking button", () => {
    setup({ role: "pharmacist" } as User);

    // Initially expanded - labels should be visible
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Menu")).toBeInTheDocument();

    // Click collapse button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    // After collapse - labels should be hidden
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Menu")).not.toBeInTheDocument();
  });

  it("shows labels when expanded", () => {
    setup({ role: "pharmacist" } as User);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Manual Prescription Entry")).toBeInTheDocument();
  });

  it("dispatches logout and navigates to /login", () => {
    setup({ role: "pharmacist" } as User);

    fireEvent.click(screen.getByText("Logout"));

    expect(mockDispatch).toHaveBeenCalledWith({ type: "auth/serverLogout" });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows footer when expanded", () => {
    setup({ role: "pharmacist" } as User);

    expect(screen.getByText("Copyright 2025 Pharmacy App")).toBeInTheDocument();
  });

  it("hides footer when collapsed", () => {
    setup({ role: "pharmacist" } as User);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(screen.queryByText("Copyright 2025 Pharmacy App")).not.toBeInTheDocument();
  });
});

