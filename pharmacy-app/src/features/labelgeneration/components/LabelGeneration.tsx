import { useRef, useState } from "react";
import { LabelPreview } from "@labels/components/LabelPreview";
import { LabelQueueList } from "@labels/components/LabelQueueList";
import {
  useDispenseLabel,
  useLabelPdf,
  useLabelPrint,
  usePaidDispenseQueue,
} from "@labels/hooks";

export default function LabelGenerationPage() {
  const [selectedDispense, setSelectedDispense] = useState<{
    dispenseId: string;
    patientId: string;
  } | null>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);

  const queue = usePaidDispenseQueue();

  const label = useDispenseLabel(
    selectedDispense?.dispenseId ?? null,
    selectedDispense?.patientId ?? null
  );

  const print = useLabelPrint(label.label, labelContainerRef);
  const pdf = useLabelPdf(label.label, labelContainerRef);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Label Generation
        </h1>
        <p className="text-gray-500">Generate and print medication labels</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <LabelQueueList
          items={queue.items}
          loading={queue.loading}
          error={queue.error}
          selectedId={selectedDispense?.dispenseId ?? null}
          onSelect={(dispenseId, patientId) =>
            setSelectedDispense({ dispenseId, patientId })
          }
        />

        <LabelPreview
          selected={label.label}
          loading={label.loading}
          error={label.error}
          onPrint={print.print}
          onDownload={pdf.downloadPdf}
          isPrinting={print.isPrinting}
          isDownloading={pdf.isDownloading}
          labelContainerRef={labelContainerRef}
        />
      </div>
    </div>
  );
}
