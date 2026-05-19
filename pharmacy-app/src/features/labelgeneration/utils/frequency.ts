export const FREQUENCY_LABEL_MAP: Record<string, string> = {
  OD: "Once Daily",
  BID: "Twice Daily",
  TID: "Three Times Daily",
  QID: "Four Times Daily",
  Q4H: "Every 4 Hours",
  Q6H: "Every 6 Hours",
  Q8H: "Every 8 Hours",
  Q12H: "Every 12 Hours",
  PRN: "As Needed",
  STAT: "Immediately",
};

export function getFrequencyLabel(code?: string): string {
  if (!code) return "";
  return FREQUENCY_LABEL_MAP[code] ?? code;
}
