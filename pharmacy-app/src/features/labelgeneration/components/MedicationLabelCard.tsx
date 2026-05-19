import { formatDate } from "@shared/utils/formatDate";

import type { DispenseLabel, MedicationLabel } from "../domain";
import { LABEL_WARNINGS } from "../domain";
import { formatCurrency } from "../utils/currency";
import { getFrequencyLabel } from "../utils/frequency";

type Props = {
  label: DispenseLabel;
  medicine: MedicationLabel;
};

export function MedicationLabelCard({ label, medicine }: Props) {
  return (
    <div
      className="print-label border-2 border-gray-300 rounded-lg p-6 bg-white mb-6"
      style={{ fontFamily: "monospace" }}
    >
      <div className="border-b-2 border-gray-300 pb-4 mb-4">
        <div className="font-bold">MEDIFLOW PHARMACY</div>
        <div>123 Healthcare Blvd, Springfield, IL 62701</div>
        <div>Phone: (555) 123-4567</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b-2 border-gray-300">
        <div>
          <div className="text-xs">PATIENT</div>
          <div>{label.patientName}</div>
        </div>

        <div>
          <div className="text-xs">DISPENSE #</div>
          <div>{label.dispenseId}</div>
        </div>

        <div>
          <div className="text-xs">DATE</div>
          <div>{formatDate(label.dispenseDate)}</div>
        </div>

        <div>
          <div className="text-xs">PRESCRIPTION #</div>
          <div>{label.prescriptionId}</div>
        </div>

        <div>
          <div className="text-xs">STATUS</div>
          <div>{label.status}</div>
        </div>

        <div>
          <div className="text-xs">PHARMACIST</div>
          <div>{label.pharmacistId}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold">{medicine.productName}</div>

        <div className="mb-2">QTY: {medicine.quantityDispensed}</div>
        <div className="mb-2">Refill: {medicine.refillNumber}</div>
        <div className="mb-2">
          Frequency: {getFrequencyLabel(medicine.frequency)}
        </div>

        <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
          <div className="font-semibold">DIRECTIONS:</div>
          <div>{medicine.instructions}</div>
        </div>
      </div>

      {medicine.lotsUsed.length > 0 && (
        <div className="border-t border-gray-300 pt-4 mb-4">
          <div className="font-semibold mb-2">LOT DETAILS</div>
          <ul className="space-y-1 text-sm">
            {medicine.lotsUsed.map((lot) => (
              <li key={lot.lotId}>
                {lot.lotId}: {lot.quantity} unit(s), exp{" "}
                {formatDate(lot.expiry)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-gray-300 pt-4 mb-4">
        <div className="font-semibold mb-2">PRICING</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Unit Price: {formatCurrency(medicine.pricing.unitPrice)}</div>
          <div>Total: {formatCurrency(medicine.pricing.total)}</div>
          <div>Insurance: {formatCurrency(medicine.pricing.insurancePaid)}</div>
          <div>
            Patient Payable: {formatCurrency(medicine.pricing.patientPayable)}
          </div>
        </div>
        {medicine.isManualAdjustment && (
          <div className="mt-2 text-xs font-semibold text-amber-700">
            Manual adjustment applied
          </div>
        )}
      </div>

      <div className="border-t-2 border-gray-300 pt-4">
        <div className="font-semibold mb-2">WARNINGS</div>
        <ul className="space-y-1">
          {LABEL_WARNINGS.map((warning) => (
            <li key={warning}>- {warning}</li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-300">
        Pharmacist: Dr. Jane Smith - License: PH-12345
      </div>
    </div>
  );
}
