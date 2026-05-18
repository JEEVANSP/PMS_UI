import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useValidationPrescriptionDetails } from "../hooks/useValidationPrescriptionDetails";
import { getPrescriptionById } from "@prescription/api";
import type { PrescriptionDetailsDto } from "@prescription/api";

vi.mock("@prescription/api", () => ({
  getPrescriptionById: vi.fn(),
}));

vi.mock("@prescription/domain/mapper", () => ({
  mapDetailsDto: vi.fn((value) => value),
}));

describe("useValidationPrescriptionDetails", () => {
  const mockedApi = vi.mocked(getPrescriptionById);
  const mockData = { id: "RX-001" } as PrescriptionDetailsDto;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads data and etag successfully", async () => {
    mockedApi.mockResolvedValueOnce({ data: mockData, etag: "etag-1" });

    const { result } = renderHook(() =>
      useValidationPrescriptionDetails("RX-001", "P-001")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.etag).toBe("etag-1");
    expect(result.current.error).toBeNull();
    expect(mockedApi).toHaveBeenCalledWith("RX-001", "P-001");
  });

  it("sets missing context error without calling the API", async () => {
    const { result } = renderHook(() =>
      useValidationPrescriptionDetails("RX-001", "")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.etag).toBe("");
    expect(result.current.error).toBe("Missing patient context.");
    expect(mockedApi).not.toHaveBeenCalled();
  });

  it("handles API errors", async () => {
    mockedApi.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() =>
      useValidationPrescriptionDetails("RX-001", "P-001")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
  });
});
