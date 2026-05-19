import { useCallback, useState } from "react";
import { logger } from "@core/logger/logger";
import { toast } from "@shared/ui/toast";

import type { RefObject } from "react";
import type { DispenseLabel } from "../domain";

const PRINT_LABEL_SELECTOR = ".print-label";

type LabelContainerRef = RefObject<HTMLElement | null>;

function getPrintableLabels(labelContainerRef: LabelContainerRef) {
  const container = labelContainerRef.current;

  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(PRINT_LABEL_SELECTOR)
  );
}

export function useLabelPrint(
  label: DispenseLabel | null,
  labelContainerRef: LabelContainerRef
) {
  const [isPrinting, setIsPrinting] = useState(false);

  const print = useCallback(() => {
    if (!label) {
      toast.warning("No Dispense Selected", "Please select a dispense first.");
      return;
    }

    const labels = getPrintableLabels(labelContainerRef);

    if (labels.length === 0) {
      toast.warning("No Labels Found", "No labels available to print.");
      return;
    }

    setIsPrinting(true);

    try {
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        toast.error("Popup Blocked", "Please allow popups to print labels.");
        setIsPrinting(false);
        return;
      }

      const printContent = labels.map((item) => item.outerHTML).join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Medication Labels - ${label.patientName || "Patient"}</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }

              body {
                margin: 0;
                padding: 1.5cm;
                font-family: monospace;
                background: white;
              }

              .labels-container {
                display: flex;
                flex-wrap: wrap;
                gap: 1cm;
                justify-content: flex-start;
                align-items: flex-start;
              }

              .print-label {
                width: 10cm !important;
                max-width: 10cm !important;
                flex-shrink: 0;
                border: 2px solid #000 !important;
                border-radius: 8px;
                padding: 10px !important;
                background: white;
                margin: 0 !important;
                font-size: 9px !important;
                line-height: 1.3 !important;
                box-sizing: border-box;
                page-break-inside: avoid;
              }

              .print-label .font-bold,
              .print-label .font-semibold { font-weight: bold; }

              .print-label > div:first-child { font-size: 11px !important; }
              .print-label > div:first-child > div:first-child { font-size: 13px !important; font-weight: bold; }

              .print-label .border-b-2 { border-bottom: 2px solid #333 !important; padding-bottom: 8px !important; margin-bottom: 8px !important; }
              .print-label .border-t-2 { border-top: 2px solid #333 !important; padding-top: 8px !important; margin-top: 8px !important; }
              .print-label .border-t { border-top: 1px solid #ccc !important; }
              .print-label .border-gray-300 { border-color: #333 !important; }

              .print-label .grid { display: grid; }
              .print-label .grid-cols-2 { grid-template-columns: repeat(2, 1fr); gap: 8px !important; }

              .print-label .text-xs { font-size: 7px !important; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 2px; }
              .print-label .text-sm { font-size: 8px !important; }
              .print-label .font-semibold { font-weight: 600; font-size: 10px !important; }

              .print-label .bg-yellow-50 { background: #fffbeb !important; border: 2px solid #f59e0b !important; border-radius: 4px; padding: 6px !important; margin-top: 4px; }

              .print-label .mb-2 { margin-bottom: 4px !important; }
              .print-label .mb-4 { margin-bottom: 8px !important; }
              .print-label .mt-4 { margin-top: 8px !important; }
              .print-label .pt-4 { padding-top: 8px !important; }
              .print-label .pb-4 { padding-bottom: 8px !important; }
              .print-label .p-6 { padding: 10px !important; }
              .print-label .p-3 { padding: 6px !important; }

              .print-label .space-y-1 > * + * { margin-top: 2px !important; }

              .print-label ul { list-style: none; padding-left: 0; font-size: 8px !important; }
              .print-label li { line-height: 1.4; }
              .print-label .text-gray-500 { color: #666 !important; }

              @page { margin: 1.5cm; size: A4 portrait; }

              @media print {
                body { padding: 0; }
                .labels-container { gap: 1cm; }
                .print-label { box-shadow: none !important; }
              }

              @media screen {
                body { background: #f5f5f5; }
                .print-label { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              }
            </style>
          </head>
          <body>
            <div class="labels-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                setTimeout(function() { window.print(); }, 250);
              };
              window.onafterprint = function() { window.close(); };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      window.setTimeout(() => setIsPrinting(false), 1000);
    } catch (error) {
      logger.error("useLabelPrint failed", { error });
      toast.error(
        "Print Failed",
        "An error occurred while preparing labels for printing."
      );
      setIsPrinting(false);
    }
  }, [label, labelContainerRef]);

  return {
    isPrinting,
    print,
  };
}
