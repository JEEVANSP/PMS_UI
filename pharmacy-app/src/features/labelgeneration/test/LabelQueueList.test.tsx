import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LabelQueueList } from "../components/LabelQueueList";

import type { LabelQueueItem } from "../domain";

function createQueueItem(overrides?: Partial<LabelQueueItem>): LabelQueueItem {
  return {
    dispenseId: "DSP-DEFAULT",
    prescriptionId: "PR-DEFAULT",
    patientId: "P-DEFAULT",
    patientName: "Default Patient",
    dispenseDate: "2024-01-01T00:00:00Z",
    status: "Paid",
    itemCount: 1,
    grandTotal: 15,
    ...overrides,
  };
}

describe("LabelQueueList", () => {
  const mockOnSelect = vi.fn();

  const mockItems: LabelQueueItem[] = [
    createQueueItem({
      dispenseId: "DSP-001",
      prescriptionId: "PR-001",
      patientId: "P-001",
      patientName: "John Doe",
      itemCount: 2,
      grandTotal: 32.5,
    }),
    createQueueItem({
      dispenseId: "DSP-002",
      prescriptionId: "PR-002",
      patientId: "P-002",
      patientName: "Jane Smith",
      itemCount: 1,
      grandTotal: 18,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    render(
      <LabelQueueList
        items={[]}
        loading
        error={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <LabelQueueList
        items={[]}
        loading={false}
        error="Failed to load"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("renders empty state when no items are available", () => {
    render(
      <LabelQueueList
        items={[]}
        loading={false}
        error={null}
        onSelect={mockOnSelect}
      />
    );

    expect(
      screen.getByText("No dispenses ready for labels")
    ).toBeInTheDocument();
  });

  it("renders queue items correctly", () => {
    render(
      <LabelQueueList
        items={mockItems}
        loading={false}
        error={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Dispense ID: DSP-001")).toBeInTheDocument();
    expect(screen.getByText("Prescription ID: PR-001")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("2 item(s)")).toBeInTheDocument();

    expect(screen.getByText("Dispense ID: DSP-002")).toBeInTheDocument();
    expect(screen.getByText("Prescription ID: PR-002")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("1 item(s)")).toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", () => {
    render(
      <LabelQueueList
        items={mockItems}
        loading={false}
        error={null}
        onSelect={mockOnSelect}
      />
    );

    const firstButton = screen.getByRole("button", {
      name: /DSP-001/i,
    });

    fireEvent.click(firstButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith("DSP-001", "P-001");
  });

  it("applies active styling when selectedId matches", () => {
    render(
      <LabelQueueList
        items={mockItems}
        loading={false}
        error={null}
        selectedId="DSP-002"
        onSelect={mockOnSelect}
      />
    );

    const activeButton = screen.getByRole("button", {
      name: /DSP-002/i,
    });

    expect(activeButton.className).toContain("bg-blue-50");
  });
});
