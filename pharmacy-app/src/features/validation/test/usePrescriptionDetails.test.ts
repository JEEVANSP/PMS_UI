import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePrescriptionDetails } from "../hooks/usePrescriptionDetails";
import { getPrescriptionById } from "@api/prescription";
import type { PrescriptionDetailsDto } from "@api/prescription";

vi.mock("@api/prescription", () => ({
  getPrescriptionById: vi.fn(),
}));

vi.mock("@prescription/domain/mapper", () => ({
  mapDetailsDto: vi.fn((value) => value),
}));

describe("usePrescriptionDetails", () => {
  const mockedApi = vi.mocked(getPrescriptionById);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData: PrescriptionDetailsDto = {
    id: "RX-001",
  } as PrescriptionDetailsDto;

  it("initially sets loading to true", () => {
    mockedApi.mockResolvedValueOnce({ data: mockData, etag: "" });

    const { result } = renderHook(() =>
      usePrescriptionDetails("RX-001", "P-001")
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("loads data successfully", async () => {
    mockedApi.mockResolvedValueOnce({ data: mockData, etag: "etag-1" });

    const { result } = renderHook(() =>
      usePrescriptionDetails("RX-001", "P-001")
    );

    await waitFor(() =>
      expect(result.current.loading).toBe(false)
    );

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockedApi).toHaveBeenCalledWith("RX-001", "P-001");
  });

  it("handles API error with response message", async () => {
    mockedApi.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });

    const { result } = renderHook(() =>
      usePrescriptionDetails("RX-001", "P-001")
    );

    await waitFor(() =>
      expect(result.current.loading).toBe(false)
    );

    expect(result.current.error).toBe("Server error");
    expect(result.current.data).toBeNull();
  });

  it("handles API error with generic message", async () => {
    mockedApi.mockRejectedValueOnce({
      message: "Network error",
    });

    const { result } = renderHook(() =>
      usePrescriptionDetails("RX-001", "P-001")
    );

    await waitFor(() =>
      expect(result.current.loading).toBe(false)
    );

    expect(result.current.error).toBe("Network error");
  });

  it("falls back to default error message", async () => {
    mockedApi.mockRejectedValueOnce({});

    const { result } = renderHook(() =>
      usePrescriptionDetails("RX-001", "P-001")
    );

    await waitFor(() =>
      expect(result.current.loading).toBe(false)
    );

    expect(result.current.error).toBe(
      "Failed to load prescription"
    );
  });

  it("does not update state after unmount", async () => {
    let resolvePromise!: (value: { data: PrescriptionDetailsDto; etag: string }) => void;

    const pending = new Promise<{ data: PrescriptionDetailsDto; etag: string }>((res) => {
      resolvePromise = res;
    });

    mockedApi.mockReturnValueOnce(pending);

    const { unmount } = renderHook(() =>
      usePrescriptionDetails("RX-001", "P-001")
    );

    unmount();

    resolvePromise({ data: mockData, etag: "" });

    await Promise.resolve();

    expect(mockedApi).toHaveBeenCalledTimes(1);
  });

  it("refetches when rxId changes", async () => {
    mockedApi
      .mockResolvedValueOnce({
        data: { id: "RX-001" } as PrescriptionDetailsDto,
        etag: "",
      })
      .mockResolvedValueOnce({
        data: { id: "RX-002" } as PrescriptionDetailsDto,
        etag: "",
      });

    const { result, rerender } = renderHook(
      ({ id }) => usePrescriptionDetails(id, "P-001"),
      { initialProps: { id: "RX-001" } }
    );

    await waitFor(() =>
      expect(result.current.loading).toBe(false)
    );

    rerender({ id: "RX-002" });

    await waitFor(() =>
      expect(result.current.data?.id).toBe("RX-002")
    );

    expect(mockedApi).toHaveBeenCalledTimes(2);
  });
});
