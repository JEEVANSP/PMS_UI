export type LabelQueueItem = {
  dispenseId: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  dispenseDate: string;
  status: string;
  itemCount: number;
  grandTotal: number;
};

export type LabelLotUsage = {
  lotId: string;
  quantity: number;
  expiry: string;
};

export type LabelPricing = {
  unitPrice: number;
  total: number;
  insurancePaid: number;
  patientPayable: number;
};

export type MedicationLabel = {
  prescriptionLineId: string;
  productId: string;
  productName: string;
  frequency: string;
  instructions: string;
  refillNumber: number;
  quantityDispensed: number;
  isManualAdjustment: boolean;
  lotsUsed: LabelLotUsage[];
  pricing: LabelPricing;
};

export type DispenseLabel = {
  dispenseId: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  dispenseDate: string;
  status: string;
  pharmacistId: string;
  items: MedicationLabel[];
};
