import type {
  DispenseLabelDto,
  DispenseLabelItemDto,
  DispenseSummaryDto,
} from "../api";

import type {
  DispenseLabel,
  LabelQueueItem,
  MedicationLabel,
} from "./model";

export function mapQueueItem(dto: DispenseSummaryDto): LabelQueueItem {
  return {
    dispenseId: dto.id,
    prescriptionId: dto.prescriptionId,
    patientId: dto.patientId,
    patientName: dto.patientName,
    dispenseDate: dto.dispenseDate,
    status: dto.status,
    itemCount: dto.itemCount,
    grandTotal: dto.grandTotal,
  };
}

function mapMedication(dto: DispenseLabelItemDto): MedicationLabel {
  return {
    prescriptionLineId: dto.prescriptionLineId,
    productId: dto.productId,
    productName: dto.productName,
    frequency: dto.frequency,
    instructions: dto.instructions,
    refillNumber: dto.refillNumber,
    quantityDispensed: dto.quantityDispensed,
    isManualAdjustment: dto.isManualAdjustment,
    lotsUsed: dto.lotsUsed,
    pricing: dto.pricing,
  };
}

export function mapDispenseLabel(dto: DispenseLabelDto): DispenseLabel {
  return {
    dispenseId: dto.dispenseId,
    prescriptionId: dto.prescriptionId,
    patientId: dto.patientId,
    patientName: dto.patientName,
    dispenseDate: dto.dispenseDate,
    status: dto.status,
    pharmacistId: dto.pharmacistId,
    items: dto.items.map(mapMedication),
  };
}
