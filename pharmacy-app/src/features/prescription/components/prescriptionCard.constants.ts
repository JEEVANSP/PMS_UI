export const prescriptionStatusConfig = {
  Urgent: { bg: "bg-red-100", text: "text-red-600" },
  Rejected: { bg: "bg-red-100", text: "text-red-600" },
  Cancelled: { bg: "bg-red-100", text: "text-red-600" },
  Ready: { bg: "bg-green-100", text: "text-green-600" },
  Validated: { bg: "bg-green-100", text: "text-green-600" },
  Collected: { bg: "bg-purple-100", text: "text-purple-600" },
  Dispensed: { bg: "bg-blue-100", text: "text-blue-600" },
  "In Progress": { bg: "bg-gray-100", text: "text-gray-600" },
  Created: { bg: "bg-gray-100", text: "text-gray-600" },
} as const;

export type PrescriptionStatus = keyof typeof prescriptionStatusConfig;

export function isPrescriptionStatus(value: unknown): value is PrescriptionStatus {
  return typeof value === "string" && value in prescriptionStatusConfig;
}
