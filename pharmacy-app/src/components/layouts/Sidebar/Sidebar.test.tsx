import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "@components/layouts/Sidebar/Sidebar";
import type { User } from "@app/store/auth/auth.types";

let mockCollapsed = false;

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-redux", () => {
  type MockState = { ui: { sidebarCollapsed: boolean } };
  return {
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: MockState) => unknown) =>
      selector({
        ui: { sidebarCollapsed: mockCollapsed },
      }),
  };
});

vi.mock("@app/store/auth/authSlice", () => ({
  default: (state = {}) => state,
  serverLogout: () => ({ type: "auth/serverLogout" }),
}));

vi.mock("@app/store/ui/uiSlice", () => ({
  default: (state = {}) => state,
  toggleSidebar: () => ({ type: "ui/toggleSidebar" }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function setup(user: User, collapsed = false) {
  mockCollapsed = collapsed;

  return render(
    <MemoryRouter>
      <Sidebar user={user} />
    </MemoryRouter>,
  );
}

describe("Sidebar Component", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
  });

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

  it("dispatches toggleSidebar when clicking collapse button", () => {
    setup({ role: "pharmacist" } as User);

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(mockDispatch).toHaveBeenCalledWith({ type: "ui/toggleSidebar" });
  });

  it("hides labels when collapsed", () => {
    setup({ role: "pharmacist" } as User, true);

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Manual Prescription Entry")).not.toBeInTheDocument();
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
    setup({ role: "pharmacist" } as User, true);

    expect(screen.queryByText("Copyright 2025 Pharmacy App")).not.toBeInTheDocument();
  });
});
