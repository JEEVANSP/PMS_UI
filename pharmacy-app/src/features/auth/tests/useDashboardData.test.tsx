import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { useDashboardData } from "../../dashboard/hooks/useDashboardData";
import { getAllPrescriptions } from "@prescription/api";

vi.mock("@prescription/api", () => ({
  getAllPrescriptions: vi.fn(),
}));

vi.mock("@prescription/domain/mapper", () => ({
  mapSummaryDto: vi.fn((value) => value),
}));

describe("useDashboardData", () => {
  const mockedGetAllPrescriptions = vi.mocked(getAllPrescriptions);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads recent prescriptions from the API", async () => {
    mockedGetAllPrescriptions.mockResolvedValueOnce({
      items: [
        {
          id: "rx-1",
          patientId: "p-1",
          patientName: "Alice",
          prescriberName: "Dr. Who",
          createdAt: "2026-01-01T00:00:00.000Z",
          status: "Created",
          medicineCount: 1,
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: false,
    });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.requestStatus).toBe("succeeded"));

    expect(mockedGetAllPrescriptions).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    expect(result.current.prescriptions).toEqual([
      expect.objectContaining({ id: "rx-1" }),
    ]);
    expect(result.current.totalCount).toBe(50);
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  test("uses custom pageSize param", async () => {
    mockedGetAllPrescriptions.mockResolvedValueOnce({
      items: [],
      pageNumber: 1,
      pageSize: 25,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    const { result } = renderHook(() => useDashboardData({ pageSize: 25 }));

    await waitFor(() => expect(result.current.requestStatus).toBe("succeeded"));

    expect(mockedGetAllPrescriptions).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 25 })
    );
    expect(result.current.pageSize).toBe(25);
  });

  test("sets failed status when the API rejects", async () => {
    mockedGetAllPrescriptions.mockRejectedValueOnce(new Error("Network"));

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.requestStatus).toBe("failed"));
    expect(result.current.prescriptions).toEqual([]);
  });
});
