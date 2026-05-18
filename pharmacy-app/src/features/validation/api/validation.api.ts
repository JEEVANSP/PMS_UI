import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import { extractEtag, formatIfMatch } from "@core/http/etag";
import type {
  ReviewPrescriptionRequestDto,
  ValidationResultDto,
} from "./validation.dto";

export async function getValidationResults(
  prescriptionId: string,
  patientId?: string
): Promise<ValidationResultDto> {
  const normalizedPatientId = patientId?.trim();
  const res = await api.get<ValidationResultDto>(
    ENDPOINTS.prescriptionValidate(prescriptionId),
    {
      params: normalizedPatientId ? { patientId: normalizedPatientId } : undefined,
    }
  );

  return res.data;
}

export async function reviewPrescription(
  prescriptionId: string,
  patientId: string,
  payload: ReviewPrescriptionRequestDto,
  etag: string
): Promise<string | undefined> {
  const ifMatch = formatIfMatch(etag);

  const res = await api.put(
    ENDPOINTS.prescriptionReview(prescriptionId),
    payload,
    {
      params: { patientId },
      headers: { "If-Match": ifMatch },
    }
  );

  return extractEtag(res.headers);
}
