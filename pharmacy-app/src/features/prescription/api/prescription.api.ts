import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import { extractEtag, formatIfMatch } from "@core/http/etag";
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

  if (typeof query.prescriptionId === "string" && query.prescriptionId.trim().length > 0) {
    params.prescriptionId = query.prescriptionId.trim();
  }
  if (typeof query.patientId === "string" && query.patientId.trim().length > 0) {
    params.patientId = query.patientId.trim();
  }
  if (typeof query.patientName === "string" && query.patientName.trim().length > 0) {
    params.patientName = query.patientName.trim();
  }
  if (typeof query.prescriberName === "string" && query.prescriberName.trim().length > 0) {
    params.prescriberName = query.prescriberName.trim();
  }
  if (typeof query.createdAt === "string" && query.createdAt.trim().length > 0) {
    params.createdAt = query.createdAt.trim();
  }
  if (typeof query.status === "string" && query.status.trim().length > 0) {
    params.status = query.status.trim();
  }
  if (typeof query.sortBy === "string" && query.sortBy.trim().length > 0) {
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
    { headers: { "If-Match": formatIfMatch(etag) } },
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
