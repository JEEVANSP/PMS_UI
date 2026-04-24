import type { PrescriptionReviewStatus } from "@prescription/domain/model";
import type { ValidationSeverity } from "@validation/domain/model";

export function pillToneBySeverity(
  severity: ValidationSeverity | string | null | undefined
): "red" | "amber" | "yellow" | "green" {
  switch (severity) {
    case "High":
      return "red";
    case "Moderate":
      return "amber";
    case "Low":
      return "yellow";
    default:
      return "green";
  }
}

export function mapInteractionLevel(
  severity: ValidationSeverity | string | null | undefined
): "None" | "Minor" | "Moderate" | "Major" {
  switch (severity) {
    case "High":
      return "Major";
    case "Moderate":
      return "Moderate";
    case "Low":
      return "Minor";
    default:
      return "None";
  }
}

export function computeValidation(
  medicine: {
    prescribedQuantity?: number | null;
    validation?: {
      drugAllergy?: {
        overallSeverity?: ValidationSeverity | string | null;
      };
      inventory?: {
        isPresent?: boolean | null;
        reservableNow?: number | null;
      };
    };
  },
  fallbackRequiredQty?: number
): "Blocked" | "Partial" | "OK" {
  if (medicine.validation?.drugAllergy?.overallSeverity === "High") {
    return "Blocked";
  }

  const requiredQty = medicine.prescribedQuantity ?? fallbackRequiredQty ?? 0;
  const inventory = medicine.validation?.inventory;
  const reservableNow = inventory?.reservableNow;

  if (inventory?.isPresent && typeof reservableNow === "number" && reservableNow < requiredQty) {
    return "Partial";
  }

  return "OK";
}

export function isReviewedDecision(
  decision: string | null | undefined,
): decision is Extract<PrescriptionReviewStatus, "Approved" | "Rejected"> {
  return decision === "Approved" || decision === "Rejected";
}
