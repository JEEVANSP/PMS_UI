import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { PrescriptionSummaryDto } from "@prescription/types/prescription.types";
import PharmacistDashboard from "../../dashboard/components/PharmacistDashboard";

const { mockUseDashboardData } = vi.hoisted(() => ({
  mockUseDashboardData: vi.fn(),
}));

/* ============================================
   MOCKS
============================================ */

// Mock only the hook (NOT DataTable)
vi.mock("@dashboard/hooks/useDashboardData", () => ({
  useDashboardData: mockUseDashboardData,
}));

// Mock thunk dispatch
const mockFetch = vi.fn();

vi.mock("@prescription/slices", () => ({
  fetchAllPrescriptions: (payload: unknown) => {
    mockFetch(payload);
    return { type: "mock/fetch" };
  },
}));

/* ============================================
   HELPERS
============================================ */

function createMockPrescription(
  overrides?: Partial<PrescriptionSummaryDto>
): PrescriptionSummaryDto {
  const today = new Date().toISOString();

  return {
    id: Math.random().toString(),
    patientId: "P001",
    patientName: "John Doe",
    prescriberName: "Dr. Smith",
    createdAt: today,
    status: "Created",
    medicineCount: 2,
    validationSummary: {
      totalIssues: 0,
      highSeverityCount: 0,
      moderateCount: 0,
      lowCount: 0,
      requiresReview: false,
    },
    ...overrides,
  };
}

/* ============================================
   TEST SUITE
============================================ */

describe("PharmacistDashboard - Maximum Coverage", () => {
  const mockStore = configureStore({
    reducer: () => ({}),
  });

  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <PharmacistDashboard />
      </Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dispatches fetchAllPrescriptions on mount", () => {
    (mockUseDashboardData as unknown as Mock).mockReturnValue({
      prescriptions: [],
      requestStatus: "idle",
    });

    renderComponent();

    expect(mockFetch).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });

  it("shows loading state", () => {
    (mockUseDashboardData as unknown as Mock).mockReturnValue({
      prescriptions: [],
      requestStatus: "loading",
    });

    renderComponent();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows empty state when no prescriptions today", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    (mockUseDashboardData as unknown as Mock).mockReturnValue({
      prescriptions: [
        createMockPrescription({ createdAt: yesterday.toISOString() }),
      ],
      requestStatus: "succeeded",
    });

    renderComponent();

    expect(
      screen.getByText("No Prescriptions Today")
    ).toBeInTheDocument();
  });

  it("renders real table and executes column render functions", () => {
    const prescription = createMockPrescription({
      status: "Active",
    });

    (mockUseDashboardData as unknown as Mock).mockReturnValue({
      prescriptions: [prescription],
      requestStatus: "succeeded",
    });

    renderComponent();

    // ID column
    expect(screen.getByText(prescription.id)).toBeInTheDocument();

    // Patient column (name + id)
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("P001")).toBeInTheDocument();

    // Doctor column
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();

    // Status column render
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("calculates KPI stats correctly", () => {
    const prescriptions = [
      createMockPrescription({ status: "Created" }),
      createMockPrescription({ status: "Active" }),
      createMockPrescription({ status: "Active" }),
    ];

    (mockUseDashboardData as unknown as Mock).mockReturnValue({
      prescriptions,
      requestStatus: "succeeded",
    });

    renderComponent();

    // KPI Titles
    expect(screen.getByText("Pending Prescriptions")).toBeInTheDocument();
    expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
    expect(
      screen.getByText("Today's Prescriptions", { selector: "div" })
    ).toBeInTheDocument();

    // KPI Values (assert at least one occurrence)
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("shows correct header total count", () => {
    const prescriptions = [
      createMockPrescription(),
      createMockPrescription(),
    ];

    (mockUseDashboardData as unknown as Mock).mockReturnValue({
      prescriptions,
      requestStatus: "succeeded",
    });

    renderComponent();

    expect(
      screen.getByText(/2 total prescriptions/)
    ).toBeInTheDocument();
  });
});
