import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MedicationLabelCard } from "../components/MedicationLabelCard";

import type { DispenseLabel, MedicationLabel } from "../domain";

vi.mock("@shared/utils/formatDate", () => ({
  formatDate: vi.fn(() => "01-Jan-2024"),
}));

vi.mock("../utils/frequency", () => ({
  getFrequencyLabel: vi.fn(() => "Twice Daily"),
}));

function createMockLabel(overrides?: Partial<DispenseLabel>): DispenseLabel {
  return {
    dispenseId: "DSP-001",
    prescriptionId: "RX-001",
    patientId: "P-001",
    patientName: "John Doe",
    dispenseDate: "2024-01-01T00:00:00Z",
    status: "Paid",
    pharmacistId: "PH-001",
    items: [],
    ...overrides,
  };
}

function createMockMedicine(
  overrides?: Partial<MedicationLabel>
): MedicationLabel {
  return {
    prescriptionLineId: "MED-001",
    productId: "PROD-001",
    productName: "Paracetamol",
    frequency: "BID",
    instructions: "Take after meals",
    refillNumber: 1,
    quantityDispensed: 10,
    isManualAdjustment: false,
    lotsUsed: [],
    pricing: {
      unitPrice: 1.5,
      total: 15,
      insurancePaid: 5,
      patientPayable: 10,
    },
    ...overrides,
  };
}

describe("MedicationLabelCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pharmacy header", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine()}
      />
    );

    expect(screen.getByText("MEDIFLOW PHARMACY")).toBeInTheDocument();
    expect(
      screen.getByText("123 Healthcare Blvd, Springfield, IL 62701")
    ).toBeInTheDocument();
    expect(screen.getByText("Phone: (555) 123-4567")).toBeInTheDocument();
  });

  it("renders label information correctly", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine()}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("RX-001")).toBeInTheDocument();
    expect(screen.getByText("01-Jan-2024")).toBeInTheDocument();
    expect(screen.getByText("PH-001")).toBeInTheDocument();
  });

  it("renders medicine details", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine()}
      />
    );

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("QTY: 10")).toBeInTheDocument();
    expect(screen.getByText("Frequency: Twice Daily")).toBeInTheDocument();
    expect(screen.getByText("DIRECTIONS:")).toBeInTheDocument();
    expect(screen.getByText("Take after meals")).toBeInTheDocument();
  });

  it("renders pricing through the currency utility", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine()}
      />
    );

    expect(screen.getByText("Unit Price: $1.50")).toBeInTheDocument();
    expect(screen.getByText("Total: $15.00")).toBeInTheDocument();
    expect(screen.getByText("Insurance: $5.00")).toBeInTheDocument();
    expect(screen.getByText("Patient Payable: $10.00")).toBeInTheDocument();
  });

  it("renders warnings", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine()}
      />
    );

    expect(screen.getByText("WARNINGS")).toBeInTheDocument();
    expect(
      screen.getByText(/Take as directed by physician/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Do not share this medication/i)).toBeInTheDocument();
    expect(screen.getByText(/Store at room temperature/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Keep out of reach of children/i)
    ).toBeInTheDocument();
  });

  it("renders lot details and manual adjustment when present", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine({
          isManualAdjustment: true,
          lotsUsed: [
            {
              lotId: "LOT-001",
              quantity: 3,
              expiry: "2026-01-01T00:00:00Z",
            },
          ],
        })}
      />
    );

    expect(screen.getByText("LOT DETAILS")).toBeInTheDocument();
    expect(screen.getByText(/LOT-001: 3 unit\(s\), exp/i)).toBeInTheDocument();
    expect(screen.getByText("Manual adjustment applied")).toBeInTheDocument();
  });

  it("renders footer correctly", () => {
    render(
      <MedicationLabelCard
        label={createMockLabel()}
        medicine={createMockMedicine()}
      />
    );

    expect(screen.getByText(/Pharmacist: Dr\. Jane Smith/i)).toBeInTheDocument();
  });
});
