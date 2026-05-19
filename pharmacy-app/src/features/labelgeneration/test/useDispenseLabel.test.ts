import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDispenseLabel } from "../api";
import { useDispenseLabel } from "../hooks/useDispenseLabel";

import type { DispenseLabelDto } from "../api";

vi.mock("../api", () => ({
  getDispenseLabel: vi.fn(),
}));

function createLabelDto(overrides?: Partial<DispenseLabelDto>): DispenseLabelDto {
  return {
    dispenseId: "DSP-001",
    prescriptionId: "RX-001",
    patientId: "P-001",
    patientName: "John Doe",
    dispenseDate: "2026-03-11T15:36:46.220Z",
    status: "Paid",
    pharmacistId: "PH-001",
    items: [
      {
        prescriptionLineId: "LINE-001",
        productId: "PROD-001",
        productName: "Amoxicillin",
        frequency: "BID",
        instructions: "Take one capsule twice daily",
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
    ],
    ...overrides,
  };
}

describe("useDispenseLabel", () => {
  const mockedGetDispenseLabel = vi.mocked(getDispenseLabel);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not load without a dispense and patient", () => {
    const { result } = renderHook(() => useDispenseLabel(null, null));

    expect(result.current.label).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedGetDispenseLabel).not.toHaveBeenCalled();
  });

  it("loads and maps a dispense label", async () => {
    mockedGetDispenseLabel.mockResolvedValueOnce(createLabelDto());

    const { result } = renderHook(() =>
      useDispenseLabel("DSP-001", "P-001")
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGetDispenseLabel).toHaveBeenCalledWith("DSP-001", "P-001");
    expect(result.current.error).toBeNull();
    expect(result.current.label?.dispenseId).toBe("DSP-001");
    expect(result.current.label?.items[0]?.productName).toBe("Amoxicillin");
  });

  it("stores API errors", async () => {
    mockedGetDispenseLabel.mockRejectedValueOnce(new Error("API error"));

    const { result } = renderHook(() =>
      useDispenseLabel("DSP-001", "P-001")
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.label).toBeNull();
    expect(result.current.error).toBe("API error");
  });

  it("clears label when inputs are cleared", async () => {
    mockedGetDispenseLabel.mockResolvedValueOnce(createLabelDto());

    const { result, rerender } = renderHook(
      ({ dispenseId, patientId }) => useDispenseLabel(dispenseId, patientId),
      {
        initialProps: {
          dispenseId: "DSP-001" as string | null,
          patientId: "P-001" as string | null,
        },
      }
    );

    await waitFor(() => {
      expect(result.current.label?.dispenseId).toBe("DSP-001");
    });

    rerender({ dispenseId: null, patientId: null });

    expect(result.current.label).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
