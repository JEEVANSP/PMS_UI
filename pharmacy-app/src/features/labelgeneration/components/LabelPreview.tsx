import type { RefObject } from "react";

import type { DispenseLabel } from "../domain";
import { LabelPreviewToolbar } from "./LabelPreviewToolbar";
import { MedicationLabelCard } from "./MedicationLabelCard";

type Props = {
  selected: DispenseLabel | null;
  loading: boolean;
  error?: string | null;
  onPrint: () => void;
  onDownload: () => void;
  isPrinting?: boolean;
  isDownloading?: boolean;
  labelContainerRef: RefObject<HTMLDivElement | null>;
};

export function LabelPreview({
  selected,
  loading,
  error,
  onPrint,
  onDownload,
  isPrinting = false,
  isDownloading = false,
  labelContainerRef,
}: Props) {
  return (
    <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">Label Preview</h2>

        {selected && !loading && (
          <LabelPreviewToolbar
            onPrint={onPrint}
            onDownload={onDownload}
            isPrinting={isPrinting}
            isDownloading={isDownloading}
          />
        )}
      </div>

      <div ref={labelContainerRef} className="p-6">
        {!selected && !loading && !error && (
          <div className="text-center py-12 text-gray-500">
            Select a dispense to preview labels
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-500">
            Loading label details...
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-red-600">{error}</div>
        )}

        {!loading &&
          selected &&
          selected.items.map((med) => (
            <MedicationLabelCard
              key={med.prescriptionLineId}
              label={selected}
              medicine={med}
            />
          ))}
      </div>
    </div>
  );
}
