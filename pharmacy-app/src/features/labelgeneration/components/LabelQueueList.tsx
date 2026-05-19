import { formatDate } from "@shared/utils/formatDate";

import type { LabelQueueItem } from "../domain";
import { formatCurrency } from "../utils/currency";

type Props = {
  items: LabelQueueItem[];
  loading: boolean;
  error?: string | null;
  selectedId?: string | null;
  onSelect: (dispenseId: string, patientId: string) => void;
};

export function LabelQueueList({
  items,
  loading,
  error,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Ready for Labels</h2>
      </div>

      {loading && <div className="p-4 text-gray-500">Loading...</div>}

      {!loading && error && <div className="p-4 text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="p-4 text-gray-500">No dispenses ready for labels</div>
      )}

      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const isActive = selectedId === item.dispenseId;

          return (
            <button
              key={item.dispenseId}
              type="button"
              onClick={() => onSelect(item.dispenseId, item.patientId)}
              className={`w-full p-4 text-left transition-colors ${
                isActive ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-gray-900">{item.patientName}</div>
              <div className="text-sm text-gray-600">
                Dispense ID: {item.dispenseId}
              </div>
              <div className="text-sm text-gray-600">
                Prescription ID: {item.prescriptionId}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(item.dispenseDate)}</span>
                <span>{item.itemCount} item(s)</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
                <span>{item.status}</span>
                <span>{formatCurrency(item.grandTotal)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
