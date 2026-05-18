import { useCallback, useState } from "react";
import { useAppDispatch } from "@app/store";
import { extractApiError } from "@core/errors/httpError";
import {
  reviewPrescription as reviewPrescriptionThunk,
} from "@prescription/slices";
import type { PrescriptionLineReviewDraft } from "@prescription/domain/model";

type SubmitResult =
  | { ok: true }
  | { ok: false; message: string };

export function usePrescriptionReview() {
  const dispatch = useAppDispatch();
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
        const action = await dispatch(
          reviewPrescriptionThunk({
            id: rxId,
            patientId,
            reviews,
            etag,
          })
        );

        if (reviewPrescriptionThunk.fulfilled.match(action)) {
          return { ok: true };
        }

        return {
          ok: false,
          message:
            (typeof action.payload === "string"
              ? action.payload
              : undefined) ||
            extractApiError(action.error) ||
            "Request failed",
        };
      } finally {
        setSubmitting(false);
      }
    },
    [dispatch]
  );

  return {
    submitting,
    submitReview,
  };
}
