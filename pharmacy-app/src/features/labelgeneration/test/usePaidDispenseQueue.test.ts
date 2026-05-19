import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPaidDispenseQueue } from "../api";
import { usePaidDispenseQueue } from "../hooks/usePaidDispenseQueue";

vi.mock("../api", () => ({
  getPaidDispenseQueue: vi.fn(),
}));

describe("usePaidDispenseQueue", () => {
  const mockedGetPaidDispenseQueue = vi.mocked(getPaidDispenseQueue);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and maps paid dispenses", async () => {
    mockedGetPaidDispenseQueue.mockResolvedValueOnce({
      items: [
        {
          id: "DSP-001",
          prescriptionId: "RX-001",
          patientId: "P-001",
          patientName: "John Doe",
          dispenseDate: "2026-03-11T15:36:46.220Z",
          status: "Paid",
          itemCount: 2,
          grandTotal: 32.5,
        },
      ],
      totalCount: 1,
      pageSize: 100,
    });

    const { result } = renderHook(() => usePaidDispenseQueue());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual([
      {
        dispenseId: "DSP-001",
        prescriptionId: "RX-001",
        patientId: "P-001",
        patientName: "John Doe",
        dispenseDate: "2026-03-11T15:36:46.220Z",
        status: "Paid",
        itemCount: 2,
        grandTotal: 32.5,
      },
    ]);
    expect(result.current.error).toBeNull();
    expect(mockedGetPaidDispenseQueue).toHaveBeenCalledTimes(1);
  });

  it("stores API errors", async () => {
    mockedGetPaidDispenseQueue.mockRejectedValueOnce(new Error("API error"));

    const { result } = renderHook(() => usePaidDispenseQueue());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe("API error");
  });

  it("does not update state after unmount", async () => {
    mockedGetPaidDispenseQueue.mockResolvedValueOnce({
      items: [],
      totalCount: 0,
      pageSize: 100,
    });

    const { unmount } = renderHook(() => usePaidDispenseQueue());

    unmount();

    await Promise.resolve();

    expect(mockedGetPaidDispenseQueue).toHaveBeenCalledTimes(1);
  });
});
