import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LabelPreview } from "../components/LabelPreview";

import type { DispenseLabel } from "../domain";

vi.mock("../components/MedicationLabelCard", () => ({
  MedicationLabelCard: ({
    medicine,
  }: {
    medicine: { prescriptionLineId: string };
  }) => (
    <div data-testid="medication-card">
      Medicine: {medicine.prescriptionLineId}
    </div>
  ),
}));

function createLabel(): DispenseLabel {
  return {
    dispenseId: "dispense-1",
    prescriptionId: "prescription-1",
    patientId: "patient-1",
    patientName: "John Doe",
    dispenseDate: "2026-03-11T15:36:46.220Z",
    status: "Paid",
    pharmacistId: "pharmacist-1",
    items: [
      {
        prescriptionLineId: "med-1",
        productId: "prod-1",
        productName: "Drug 1",
        frequency: "BID",
        instructions: "Take twice daily",
        refillNumber: 0,
        quantityDispensed: 10,
        isManualAdjustment: false,
        lotsUsed: [],
        pricing: {
          unitPrice: 1,
          total: 10,
          insurancePaid: 5,
          patientPayable: 5,
        },
      },
      {
        prescriptionLineId: "med-2",
        productId: "prod-2",
        productName: "Drug 2",
        frequency: "OD",
        instructions: "Take daily",
        refillNumber: 0,
        quantityDispensed: 5,
        isManualAdjustment: false,
        lotsUsed: [],
        pricing: {
          unitPrice: 2,
          total: 10,
          insurancePaid: 0,
          patientPayable: 10,
        },
      },
    ],
  };
}

describe("LabelPreview", () => {
  const mockOnPrint = vi.fn();
  const mockOnDownload = vi.fn();
  const mockSelected = createLabel();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no selection exists", () => {
    render(
      <LabelPreview
        selected={null}
        loading={false}
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    expect(
      screen.getByText("Select a dispense to preview labels")
    ).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(
      <LabelPreview
        selected={null}
        loading
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    expect(screen.getByText("Loading label details...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <LabelPreview
        selected={null}
        loading={false}
        error="Something went wrong"
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders medication cards when selected", () => {
    render(
      <LabelPreview
        selected={mockSelected}
        loading={false}
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    expect(screen.getAllByTestId("medication-card")).toHaveLength(2);
  });

  it("calls onPrint when print button is clicked", () => {
    render(
      <LabelPreview
        selected={mockSelected}
        loading={false}
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /print label/i }));

    expect(mockOnPrint).toHaveBeenCalledTimes(1);
  });

  it("calls onDownload when download button is clicked", () => {
    render(
      <LabelPreview
        selected={mockSelected}
        loading={false}
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    expect(mockOnDownload).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when printing", () => {
    render(
      <LabelPreview
        selected={mockSelected}
        loading={false}
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        isPrinting
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    expect(screen.getByRole("button", { name: /preparing/i })).toBeDisabled();
  });

  it("disables buttons when downloading", () => {
    render(
      <LabelPreview
        selected={mockSelected}
        loading={false}
        error={null}
        onPrint={mockOnPrint}
        onDownload={mockOnDownload}
        isDownloading
        labelContainerRef={createRef<HTMLDivElement>()}
      />
    );

    expect(
      screen.getByRole("button", { name: /generating pdf/i })
    ).toBeDisabled();
  });
});
