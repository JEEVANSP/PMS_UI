import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import type {
  ReviewPrescriptionRequestDto,
  ValidationResultDto,
} from "./validation.dto";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeEtag(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  const cleaned = value.trim().replace(/"/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

function extractEtag(headers: unknown): string | undefined {
  if (!headers) return undefined;

  const getter = headers as { get?: (name: string) => unknown };
  if (typeof getter.get === "function") {
    const viaGetter = normalizeEtag(
      getter.get("Etag") ?? getter.get("ETag") ?? getter.get("etag")
    );
    if (viaGetter) return viaGetter;
  }

  if (typeof headers === "object" && headers !== null) {
    const record = headers as Record<string, unknown>;
    return normalizeEtag(record.Etag ?? record.ETag ?? record.etag);
  }

  return undefined;
}

function formatIfMatch(Etag: string): string {
  const trimmed = Etag.trim();
  return trimmed.startsWith('"') ? trimmed : `"${trimmed}"`;
}

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
  Etag: string
): Promise<string | undefined> {
  const ifMatch = formatIfMatch(Etag);
  console.log("Review API If-Match", ifMatch);

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
