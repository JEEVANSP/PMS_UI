export type PrescriptionStatus =
  | "Created"
  | "Active"
  | "Cancelled"
  | "Completed"
  | "CREATED"
  | "ACTIVE"
  | "CANCELLED"
  | "COMPLETED";
export type ValidationSeverity = "High" | "Moderate" | "Low" | "None";
export type PrescriptionReviewStatus = "Pending" | "Approved" | "Rejected";

export interface PrescriptionSummary {
  id: string;
  patientId: string;
  patientName: string;
  prescriberName: string;
  createdAt: Date | string;
  status: PrescriptionStatus;
  medicineCount: number;
  alerts?: boolean;
  expiresAt?: Date | string;
  validationSummary?: {
    totalIssues: number;
    highSeverityCount: number;
    moderateCount: number;
    lowCount: number;
    requiresReview: boolean;
  };
}

export interface PrescriptionLineValidation {
  hasAllergy: boolean;
  hasInteraction: boolean;
  severity: ValidationSeverity;
  drugAllergy?: {
    isPresent?: boolean;
    overallSeverity?: ValidationSeverity | string | null;
    allergies?: Array<unknown>;
  };
  drugInteraction?: {
    isPresent?: boolean;
    overallSeverity?: ValidationSeverity | string | null;
    interactingWith?: Array<unknown>;
  };
  inventory?: {
    isPresent?: boolean | null;
    severity?: ValidationSeverity | string | null;
    requiredQty?: number;
    reservableNow?: number | null;
    message?: string | null;
  };
  lowStock?: {
    isPresent?: boolean;
    severity?: ValidationSeverity | null;
    requiredQty?: number;
    availableQty?: number;
    message?: string | null;
  };
  interactionDetails?: Array<{
    productId?: string;
    productName?: string;
    severity?: ValidationSeverity;
    message?: string;
  }>;
}

export interface PrescriptionLineReview {
  status: PrescriptionReviewStatus;
  decision?: PrescriptionReviewStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  notes?: string | null;
  overrideReason?: string | null;
}

export interface PrescriptionLine {
  lineId: string;
  prescriptionMedicineId?: string;
  productId: string;
  productName?: string;
  name: string;
  strength: string;
  frequency: string;
  instructions: string;
  instruction?: string | null;
  durationDays: number;
  daysSupply?: number;
  quantityPrescribed: number;
  prescribedQuantity?: number;
  quantityApprovedPerFill: number | null;
  quantityDispensed: number;
  dispensedQuantity?: number;
  refillsAllowed: number;
  totalRefillsAuthorized?: number;
  refillsRemaining: number;
  endDate?: string | null;
  validation: PrescriptionLineValidation;
  review: PrescriptionLineReview;
  pharmacistReview?: PrescriptionLineReview;
}

export interface PrescriptionDetails {
  id: string;
  patientId: string;
  patientName: string;
  prescriber: {
    id: string;
    name: string;
  };
  prescriberName: string;
  createdAt: Date | string;
  expiresAt?: Date | string;
  isRefillable?: boolean;
  status: PrescriptionStatus;
  medicineCount: number;
  medicines: PrescriptionLine[];
}

export interface PrescriptionLineReviewDraft {
  prescriptionLineId?: string;
  lineId?: string;
  status: "Approved" | "Rejected";
  notes?: string | null;
}
