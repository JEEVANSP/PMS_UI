import type {
  PrescriptionDetails,
  PrescriptionLine,
  PrescriptionSummary,
} from "@prescription/domain/model";

export type {
  PrescriptionLine,
  PrescriptionStatus,
  PrescriptionSummary,
  ValidationSeverity,
} from "@prescription/domain/model";

export type {
  CreatePrescriptionRequestDto as CreatePrescriptionRequest,
  PrescriptionDetailsDto as ApiPrescriptionDetailsDto,
  PrescriptionLineDto as ApiPrescriptionMedicineDto,
  PrescriptionLineReviewDto as ApiPharmacistReviewDto,
  PrescriptionLineValidationDto as ApiMedicineValidationDto,
  PrescriptionSummaryDto as ApiPrescriptionSummaryDto,
  PrescriptionValidationSummaryDto as ApiValidationSummaryDto,
} from "@prescription/api";

export type PrescriptionSummaryDto = PrescriptionSummary;
export type PrescriptionDetailsDto = PrescriptionDetails;
export type PrescriptionMedicineDto = PrescriptionLine;
export type PrescriberDto = PrescriptionDetails["prescriber"];
export type ValidationSummaryDto = NonNullable<PrescriptionSummary["validationSummary"]>;
export type MedicineValidationDto = PrescriptionLine["validation"];
export type PharmacistReviewDto = PrescriptionLine["review"];
