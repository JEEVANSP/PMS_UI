import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UnknownAction } from "@reduxjs/toolkit";
import { usePrescriptionReview } from "../hooks/usePrescriptionReview";
import type { PrescriptionLineReviewDraft } from "@prescription/domain/model";

type ReviewAction = UnknownAction & {
  payload?: unknown;
  error?: unknown;
};

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  reviewPrescription: vi.fn(),
}));

vi.mock("@app/store", () => ({
  useAppDispatch: () => mocks.dispatch,
}));

vi.mock("@prescription/slices", () => {
  Object.assign(mocks.reviewPrescription, {
    fulfilled: {
      match: (action: ReviewAction) => action.type === "prescriptions/review/fulfilled",
    },
  });

  return {
    reviewPrescription: mocks.reviewPrescription,
  };
});

vi.mock("@core/errors/httpError", () => ({
  extractApiError: vi.fn(() => "fallback error"),
}));

import { reviewPrescription } from "@prescription/slices";

describe("usePrescriptionReview", () => {
  const reviews = [] as PrescriptionLineReviewDraft[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes correctly", () => {
    const { result } = renderHook(() => usePrescriptionReview());

    expect(result.current.submitting).toBe(false);
  });

  it("dispatches review thunk with explicit ids and etag", async () => {
    mocks.dispatch.mockResolvedValue({
      type: "prescriptions/review/fulfilled",
      payload: { id: "RX-1" },
    });

    const { result } = renderHook(() => usePrescriptionReview());
    let response: Awaited<ReturnType<typeof result.current.submitReview>> | undefined;

    await act(async () => {
      response = await result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1");
    });

    expect(reviewPrescription).toHaveBeenCalledWith({
      id: "RX-1",
      patientId: "PAT-1",
      reviews,
      etag: "etag-1",
    });
    expect(response).toEqual({ ok: true });
  });

  it("returns string payload error", async () => {
    mocks.dispatch.mockResolvedValue({
      type: "prescriptions/review/rejected",
      payload: "Something went wrong",
      error: {},
    });

    const { result } = renderHook(() => usePrescriptionReview());
    let response: Awaited<ReturnType<typeof result.current.submitReview>> | undefined;

    await act(async () => {
      response = await result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1");
    });

    expect(response).toEqual({
      ok: false,
      message: "Something went wrong",
    });
  });

  it("falls back to extractApiError", async () => {
    mocks.dispatch.mockResolvedValue({
      type: "prescriptions/review/rejected",
      payload: null,
      error: {},
    });

    const { result } = renderHook(() => usePrescriptionReview());
    let response: Awaited<ReturnType<typeof result.current.submitReview>> | undefined;

    await act(async () => {
      response = await result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1");
    });

    expect(response).toEqual({
      ok: false,
      message: "fallback error",
    });
  });

  it("resets submitting even if dispatch throws", async () => {
    mocks.dispatch.mockRejectedValue(new Error("unexpected"));

    const { result } = renderHook(() => usePrescriptionReview());

    await act(async () => {
      await expect(
        result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1")
      ).rejects.toThrow("unexpected");
    });

    expect(result.current.submitting).toBe(false);
  });
});
