/**
 * Unit tests for usePatientPrescriptions
 *
 * What it tests:
 * - Initial load of prescriptions on mount
 * - Handling empty or null patientId
 * - Success state: items loaded correctly
 * - Pagination / loadMore functionality
 * - Handling errors from API
 * - Prevents race conditions when switching patients quickly
 * - Loading states for initial load and loadMore
 * - Reset functionality clears state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  usePatientPrescriptions,
  type GetPrescriptionsByPatientFn,
} from "../hooks/usePatientPrescriptions";

type Prescription = { id: string; name: string };

describe("usePatientPrescriptions", () => {
  const firstPage = {
    items: [
      { id: "p1", name: "Med A" },
      { id: "p2", name: "Med B" },
    ],
    pageNumber: 1,
    totalPages: 2,
  };
  const secondPage = {
    items: [{ id: "p3", name: "Med C" }],
    pageNumber: 2,
    totalPages: 2,
  };

  let getPrescriptionsByPatient: ReturnType<
    typeof vi.fn<GetPrescriptionsByPatientFn<Prescription>>
  >;

  beforeEach(() => {
    getPrescriptionsByPatient = vi.fn();
    vi.clearAllMocks();
  });

  it("loads first page on mount", async () => {
    getPrescriptionsByPatient.mockResolvedValue(firstPage);

    const { result } = renderHook(() =>
      usePatientPrescriptions(getPrescriptionsByPatient, "patient-1", 2),
    );

    expect(result.current.prescriptionsLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.prescriptionsLoading).toBe(false);
    });

    expect(getPrescriptionsByPatient).toHaveBeenCalledWith("patient-1", 1, 2);
    expect(result.current.prescriptions).toEqual(firstPage.items);
    expect(result.current.hasMore).toBe(true);
  });

  it("does nothing if patientId is null", async () => {
    const { result } = renderHook(() =>
      usePatientPrescriptions(getPrescriptionsByPatient, null),
    );

    expect(result.current.prescriptions).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.prescriptionsError).toBeNull();
    expect(getPrescriptionsByPatient).not.toHaveBeenCalled();
  });

  it("loads more prescriptions correctly", async () => {
    getPrescriptionsByPatient
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    const { result } = renderHook(() =>
      usePatientPrescriptions(getPrescriptionsByPatient, "patient-1", 2),
    );

    // ✅ Important: use an assertion inside waitFor
    await waitFor(() => {
      expect(result.current.prescriptionsLoading).toBe(false);
    });

    expect(result.current.prescriptions).toEqual(firstPage.items);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(getPrescriptionsByPatient).toHaveBeenCalledTimes(2);
    expect(getPrescriptionsByPatient).toHaveBeenLastCalledWith("patient-1", 2, 2);
    expect(result.current.prescriptions).toEqual([
      ...firstPage.items,
      ...secondPage.items,
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it("handles API errors gracefully", async () => {
    getPrescriptionsByPatient.mockImplementation(() =>
      Promise.reject(new Error("Network error")),
    );

    const { result } = renderHook(() =>
      usePatientPrescriptions(getPrescriptionsByPatient, "patient-1"),
    );

    await waitFor(() => {
      expect(result.current.prescriptionsError).toBe("Network error");
    });

    expect(result.current.prescriptions).toEqual([]);
    expect(result.current.prescriptionsLoading).toBe(false);
  });

  it("prevents race conditions when switching patients quickly", async () => {
    let resolveFirst: (v: { items: Prescription[]; pageNumber: number; totalPages: number }) => void;
    let resolveSecond: (v: { items: Prescription[]; pageNumber: number; totalPages: number }) => void;

    const firstPromise = new Promise<{ items: Prescription[]; pageNumber: number; totalPages: number }>((res) => {
      resolveFirst = res;
    });
    const secondPromise = new Promise<{ items: Prescription[]; pageNumber: number; totalPages: number }>((res) => {
      resolveSecond = res;
    });

    getPrescriptionsByPatient
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result, rerender } = renderHook(
      ({ patientId }) =>
        usePatientPrescriptions(getPrescriptionsByPatient, patientId),
      { initialProps: { patientId: "p1" } },
    );

    // Switch patient before first resolves
    rerender({ patientId: "p2" });

    await act(async () =>
      resolveSecond!({
        items: [{ id: "pX", name: "X" }],
        pageNumber: 1,
        totalPages: 1,
      }),
    );
    await act(async () =>
      resolveFirst!({
        items: [{ id: "p1", name: "A" }],
        pageNumber: 1,
        totalPages: 1,
      }),
    );

    expect(result.current.prescriptions).toEqual([{ id: "pX", name: "X" }]);
  });

  it("reset clears state", async () => {
    getPrescriptionsByPatient.mockResolvedValue(firstPage);

    const { result } = renderHook(() =>
      usePatientPrescriptions(getPrescriptionsByPatient, "patient-1"),
    );

    await waitFor(() => {
      expect(result.current.prescriptionsLoading).toBe(false);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.prescriptions).toEqual([]);
    expect(result.current.prescriptionsError).toBeNull();
    expect(result.current.prescriptionsLoading).toBe(false);
    expect(result.current.prescriptionsLoadingMore).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });
});
