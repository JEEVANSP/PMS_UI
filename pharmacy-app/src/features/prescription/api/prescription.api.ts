import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import { logger } from "@core/logger/logger";
import type {
  ApiEntityResponse,
  CreatePrescriptionRequestDto,
  PatientPrescriptionHistoryResponse,
  PrescriptionDetailsDto,
  PrescriptionHistoryQueryParams,
  PrescriptionListResponseDto,
  PrescriptionSummaryDto,
} from "./prescription.dto";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeEtag(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  const cleaned = value.trim().replace(/"/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

export function extractEtag(headers: unknown): string | undefined {
  if (!headers) return undefined;

  const getter = headers as { get?: (name: string) => unknown };
  if (typeof getter.get === "function") {
    const viaGetter = normalizeEtag(
      getter.get("Etag") ?? getter.get("ETag") ?? getter.get("etag"),
    );
    if (viaGetter) return viaGetter;
  }

  if (typeof headers === "object" && headers !== null) {
    const record = headers as Record<string, unknown>;
    return normalizeEtag(record.Etag ?? record.ETag ?? record.etag);
  }

  return undefined;
}

function requireEtag(etag: string): string {
  if (!isNonEmptyString(etag)) throw new Error("Missing ETag");
  const trimmed = etag.trim();
  // ETag is stored without quotes (normalizeEtag strips them).
  // If-Match requires a quoted entity-tag per HTTP spec.
  return trimmed.startsWith('"') ? trimmed : `"${trimmed}"`;
}

function toSummaryDto(
  dto: PrescriptionDetailsDto | PrescriptionSummaryDto,
): PrescriptionSummaryDto {
  if (!("prescriber" in dto)) return dto;

  return {
    id: dto.id,
    patientId: dto.patientId,
    patientName: dto.patientName,
    prescriberName: dto.prescriber.name,
    createdAt: dto.createdAt,
    status: dto.status,
    medicineCount: Array.isArray(dto.medicines) ? dto.medicines.length : 0,
  };
}

function normalizePatientPrescriptionHistory(
  payload: PatientPrescriptionHistoryResponse,
  fallbackPageNumber: number,
  fallbackPageSize: number,
): PrescriptionListResponseDto {
  if (Array.isArray(payload)) {
    const items = payload.map((item) => toSummaryDto(item));

    return {
      items,
      pageNumber: fallbackPageNumber,
      pageSize: fallbackPageSize,
      totalCount: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if ("items" in payload) return payload;

  return {
    items: [toSummaryDto(payload)],
    pageNumber: fallbackPageNumber,
    pageSize: fallbackPageSize,
    totalCount: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export async function createPrescription(
  payload: CreatePrescriptionRequestDto,
): Promise<ApiEntityResponse<PrescriptionDetailsDto>> {
  const res = await api.post<PrescriptionDetailsDto>(ENDPOINTS.prescriptions, payload);
  const Etag = extractEtag(res.headers);
  return { data: res.data, Etag, etag: Etag };
}

export async function getAllPrescriptions(
  query: PrescriptionHistoryQueryParams = {},
): Promise<PrescriptionListResponseDto> {
  const params: Record<string, string | number> = {
    pageNumber: query.pageNumber ?? 1,
    pageSize: query.pageSize ?? 10,
  };

  if (isNonEmptyString(query.prescriptionId)) {
    params.prescriptionId = query.prescriptionId.trim();
  }
  if (isNonEmptyString(query.patientId)) {
    params.patientId = query.patientId.trim();
  }
  if (isNonEmptyString(query.patientName)) {
    params.patientName = query.patientName.trim();
  }
  if (isNonEmptyString(query.prescriberName)) {
    params.prescriberName = query.prescriberName.trim();
  }
  if (isNonEmptyString(query.createdAt)) {
    params.createdAt = query.createdAt.trim();
  }
  if (isNonEmptyString(query.status)) {
    params.status = query.status.trim();
  }
  if (isNonEmptyString(query.sortBy)) {
    params.sortBy = query.sortBy.trim();
  }
  if (query.sortDirection) {
    params.sortDirection = query.sortDirection;
  }

  const res = await api.get<PrescriptionListResponseDto>(ENDPOINTS.prescriptions, { params });
  return res.data;
}

export async function getPrescriptionsByPatient(
  patientId: string,
  query: Pick<PrescriptionHistoryQueryParams, "pageNumber" | "pageSize"> = {},
): Promise<PrescriptionListResponseDto> {
  const normalizedPatientId = patientId.trim();
  const pageNumber = query.pageNumber ?? 1;
  const pageSize = query.pageSize ?? 10;
  const res = await api.get<PatientPrescriptionHistoryResponse>(
    ENDPOINTS.prescriptionsByPatient(normalizedPatientId),
    { params: { pageNumber, pageSize } },
  );

  return normalizePatientPrescriptionHistory(res.data, pageNumber, pageSize);
}

export async function getPrescriptionById(
  id: string,
  patientId: string,
): Promise<ApiEntityResponse<PrescriptionDetailsDto>> {
  const res = await api.get<PrescriptionDetailsDto>(ENDPOINTS.prescriptionById(id), {
    params: { patientId },
  });
  const Etag = extractEtag(res.headers);
  console.log("Prescription GET Etag", {
    id,
    patientId,
    Etag,
    headers: res.headers,
  });

  return { data: res.data, Etag, etag: Etag };
}

export async function cancelPrescription(
  id: string,
  reason: string | undefined,
  etag: string,
): Promise<string | undefined> {
  const res = await api.post(
    `/api/prescriptions/${id}/cancel`,
    reason ? { reason } : undefined,
    { headers: { "If-Match": requireEtag(etag) } },
  );

  return extractEtag(res.headers);
}

export async function getPendingPrescriptions(): Promise<PrescriptionSummaryDto[]> {
  const page = await getAllPrescriptions({
    pageNumber: 1,
    pageSize: 20,
    status: "Created",
  });

  return page.items;
}

export async function getValidatedPrescriptions(
  pageSize = 50,
  pageNumber = 1,
): Promise<PrescriptionListResponseDto> {
  try {
    const res = await api.get<PrescriptionListResponseDto>(ENDPOINTS.prescriptions, {
      params: {
        status: "Active",
        pageSize,
        pageNumber,
      },
    });

    return res.data;
  } catch (error) {
    logger.error("getValidatedPrescriptions failed", { error });
    throw error;
  }
}
