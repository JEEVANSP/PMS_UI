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

function buildPdfFilename(label: DispenseLabel) {
  const patientName =
    label.patientName
      .trim()
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "") || "Patient";

  const date = new Date().toISOString().split("T")[0];

  return `Medication_Labels_${patientName}_${date}.pdf`;
}

export function useLabelPdf(
  label: DispenseLabel | null,
  labelContainerRef: LabelContainerRef
) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = useCallback(async () => {
    if (!label) {
      toast.warning("No Dispense Selected", "Please select a dispense first.");
      return;
    }

    const labels = getPrintableLabels(labelContainerRef);

    if (labels.length === 0) {
      toast.warning("No Labels Found", "No labels available to download.");
      return;
    }

    setIsDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const labelWidth = 100;
      const gap = 10;

      let xPos = margin;
      let yPos = margin;
      let rowHeight = 0;

      for (const labelElement of labels) {
        const canvas = await html2canvas(labelElement, {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * labelWidth) / canvas.width;

        if (yPos + imgHeight > pageHeight - margin) {
          pdf.addPage();
          xPos = margin;
          yPos = margin;
          rowHeight = 0;
        }

        pdf.addImage(imgData, "PNG", xPos, yPos, labelWidth, imgHeight);
        rowHeight = Math.max(rowHeight, imgHeight);

        if (xPos + labelWidth + gap + labelWidth <= pageWidth - margin) {
          xPos += labelWidth + gap;
        } else {
          xPos = margin;
          yPos += rowHeight + gap;
          rowHeight = 0;
        }
      }

      const filename = buildPdfFilename(label);

      pdf.save(filename);
      toast.success("Download Complete", `Labels saved as ${filename}`);
    } catch (error) {
      logger.error("useLabelPdf failed", { error });
      toast.error(
        "Download Failed",
        "An error occurred while generating the PDF. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  }, [label, labelContainerRef]);

  return {
    downloadPdf,
    isDownloading,
  };
}
