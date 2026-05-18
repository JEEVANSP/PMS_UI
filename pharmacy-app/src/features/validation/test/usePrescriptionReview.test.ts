import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePrescriptionReview } from "../hooks/usePrescriptionReview";
import type { PrescriptionLineReviewDraft } from "@prescription/domain/model";

const mocks = vi.hoisted(() => ({
  reviewPrescription: vi.fn(),
  extractApiError: vi.fn((_error: unknown) => "fallback error"),
}));

vi.mock("@validation/api", () => ({
  reviewPrescription: (...args: unknown[]) => mocks.reviewPrescription(...args),
}));

vi.mock("@core/errors/httpError", () => ({
  extractApiError: (error: unknown) => mocks.extractApiError(error),
}));

describe("usePrescriptionReview", () => {
  const reviews = [] as PrescriptionLineReviewDraft[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes correctly", () => {
    const { result } = renderHook(() => usePrescriptionReview());

    expect(result.current.submitting).toBe(false);
  });

  it("calls review API with explicit ids, mapped payload, and etag", async () => {
    mocks.reviewPrescription.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePrescriptionReview());
    let response: Awaited<ReturnType<typeof result.current.submitReview>> | undefined;

    await act(async () => {
      response = await result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1");
    });

    expect(mocks.reviewPrescription).toHaveBeenCalledWith(
      "RX-1",
      "PAT-1",
      { reviews: [] },
      "etag-1",
    );
    expect(response).toEqual({ ok: true });
  });

  it("returns extracted API error on failure", async () => {
    const error = new Error("unexpected");
    mocks.reviewPrescription.mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePrescriptionReview());
    let response: Awaited<ReturnType<typeof result.current.submitReview>> | undefined;

    await act(async () => {
      response = await result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1");
    });

    expect(mocks.extractApiError).toHaveBeenCalledWith(error);
    expect(response).toEqual({
      ok: false,
      message: "fallback error",
    });
  });

  it("resets submitting after API failure", async () => {
    mocks.reviewPrescription.mockRejectedValueOnce(new Error("unexpected"));

    const { result } = renderHook(() => usePrescriptionReview());

    await act(async () => {
      await result.current.submitReview("RX-1", "PAT-1", reviews, "etag-1");
    });

    expect(result.current.submitting).toBe(false);
  });
});
