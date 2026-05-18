import { useCallback, useState } from "react";
import { extractApiError } from "@core/errors/httpError";
import { reviewPrescription } from "@validation/api";
import { mapReviewToDto } from "@prescription/domain/mapper";
import type { PrescriptionLineReviewDraft } from "@prescription/domain/model";

type SubmitResult =
  | { ok: true }
  | { ok: false; message: string };

export function usePrescriptionReview() {
  const [submitting, setSubmitting] = useState(false);

  const submitReview = useCallback(
    async (
      rxId: string,
      patientId: string,
      reviews: PrescriptionLineReviewDraft[],
      etag: string
    ): Promise<SubmitResult> => {
      setSubmitting(true);

      try {
        const payload = mapReviewToDto(reviews);

        await reviewPrescription(
          rxId,
          patientId,
          payload,
          etag
        );

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          message:
            extractApiError(error) ||
            "Request failed",
        };
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
    submitting,
    submitReview,
  };
}
