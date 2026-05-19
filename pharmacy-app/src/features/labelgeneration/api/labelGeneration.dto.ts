export type DispenseSummaryDto = {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  dispenseDate: string;
  status: string;
  itemCount: number;
  grandTotal: number;
};

export type DispenseSummaryPagedDto = {
  items: DispenseSummaryDto[];
  totalCount: number;
  pageSize: number;
};

export type DispenseLotUsageDto = {
  lotId: string;
  quantity: number;
  expiry: string;
};

export type DispenseItemPricingDto = {
  unitPrice: number;
  total: number;
  insurancePaid: number;
  patientPayable: number;
};

export type DispenseLabelItemDto = {
  prescriptionLineId: string;
  productId: string;
  productName: string;
  frequency: string;
  instructions: string;
  refillNumber: number;
  quantityDispensed: number;
  isManualAdjustment: boolean;
  lotsUsed: DispenseLotUsageDto[];
  pricing: DispenseItemPricingDto;
};

export type DispenseLabelDto = {
  dispenseId: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  dispenseDate: string;
  status: string;
  pharmacistId: string;
  items: DispenseLabelItemDto[];
};
