export interface CreatePrescriptionRequestDto {
  patientId: string;
  patientName?: string;
  prescriber: { id: string; name: string };
  medicines: {
    productId: string;
    frequency: string;
    instructions?: string;
    durationDays: number;
    quantityPrescribed: number;
    refillsAllowed: number;
  }[];
}

export interface PrescriptionValidationSummaryDto {
  totalIssues: number;
  highSeverityCount: number;
  moderateCount: number;
  lowCount: number;
  requiresReview: boolean;
}

export interface PrescriptionSummaryDto {
  id: string;
  patientId: string;
  patientName: string;
  prescriberName: string;
  createdAt: string;
  expiresAt?: string;
  alerts?: boolean;
  status:
    | "Created"
    | "Active"
    | "Cancelled"
    | "Completed"
    | "CREATED"
    | "ACTIVE"
    | "CANCELLED"
    | "COMPLETED";
  medicineCount: number;
  validationSummary?: PrescriptionValidationSummaryDto;
}

export interface PrescriptionLineValidationDto {
  drugAllergy?: {
    isPresent: boolean;
    overallSeverity: "High" | "Moderate" | "Low" | "None" | null;
    allergies?: {
      allergenCode: string;
      severity: "High" | "Moderate" | "Low" | "None";
      message: string;
    }[];
  };
  drugInteraction?: {
    isPresent: boolean;
    overallSeverity: "High" | "Moderate" | "Low" | "None" | null;
    interactingWith?: {
      productId: string;
      productName: string;
      severity: "High" | "Moderate" | "Low" | "None";
      message: string;
    }[];
  };
  inventory?: {
    isPresent?: boolean | null;
    severity?: "High" | "Moderate" | "Low" | "None" | null;
    requiredQty?: number;
    reservableNow?: number | null;
    message?: string | null;
  };
  lowStock?: {
    isPresent?: boolean;
    severity?: "High" | "Moderate" | "Low" | "None" | null;
    requiredQty?: number;
    availableQty?: number;
    message?: string | null;
  };
}

export interface PrescriptionLineReviewDto {
  status?: "Pending" | "Approved" | "Rejected";
  decision?: "Pending" | "Approved" | "Rejected";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  notes?: string | null;
  overrideReason?: string | null;
}

export interface PrescriptionLineDto {
  id?: string;
  prescriptionLineId?: string;
  prescriptionMedicineId?: string;
  productId: string;
  productName?: string;
  name?: string;
  strength: string;
  frequency: string;
  instructions?: string | null;
  instruction?: string | null;
  durationDays?: number;
  daysSupply?: number;
  quantityPrescribed?: number;
  prescribedQuantity?: number;
  quantityApprovedPerFill?: number | null;
  quantityDispensed?: number;
  dispensedQuantity?: number;
  refillsAllowed: number;
  totalRefillsAuthorized?: number;
  refillsRemaining?: number;
  endDate?: string | null;
  validation?: PrescriptionLineValidationDto;
  pharmacistReview?: PrescriptionLineReviewDto;
}

export interface PrescriptionDetailsDto {
  id: string;
  patientId: string;
  patientName: string;
  prescriber: { id: string; name: string };
  prescriberName: string;
  createdAt: string;
  expiresAt?: string;
  isRefillable?: boolean;
  status:
    | "Created"
    | "Active"
    | "Cancelled"
    | "Completed"
    | "CREATED"
    | "ACTIVE"
    | "CANCELLED"
    | "COMPLETED";
  medicines: PrescriptionLineDto[];
  medicineCount: number;
}

export interface PrescriptionListResponseDto {
  items: PrescriptionSummaryDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiEntityResponse<T> {
  data: T;
  Etag?: string;
  etag?: string;
}

export type SortDirection = "asc" | "desc";

export interface PrescriptionHistoryQueryParams {
  prescriptionId?: string;
  patientId?: string;
  patientName?: string;
  prescriberName?: string;
  createdAt?: string;
  status?: string;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  pageNumber?: number;
}

export type PatientPrescriptionHistoryResponse =
  | PrescriptionListResponseDto
  | PrescriptionSummaryDto[]
  | PrescriptionDetailsDto
  | PrescriptionDetailsDto[];
