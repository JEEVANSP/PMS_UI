import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLabelPdf } from "../hooks/useLabelPdf";

import type { RefObject } from "react";
import type { DispenseLabel } from "../domain";

const toastMock = vi.hoisted(() => ({
  warning: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

const html2canvasMock = vi.hoisted(() =>
  vi.fn(() =>
    Promise.resolve({
      toDataURL: () => "data:image/png;base64,test",
      width: 100,
      height: 50,
    })
  )
);

const pdfMocks = vi.hoisted(() => ({
  addPage: vi.fn(),
  addImage: vi.fn(),
  save: vi.fn(),
}));

const jsPdfMock = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    addPage: pdfMocks.addPage,
    addImage: pdfMocks.addImage,
    save: pdfMocks.save,
  }))
);

vi.mock("@shared/ui/toast", () => ({
  toast: toastMock,
}));

vi.mock("@core/logger/logger", () => ({
  logger: loggerMock,
}));

vi.mock("html2canvas", () => ({
  default: html2canvasMock,
}));

vi.mock("jspdf", () => ({
  default: jsPdfMock,
}));

function createLabel(): DispenseLabel {
  return {
    dispenseId: "DSP-001",
    prescriptionId: "RX-001",
    patientId: "P-001",
    patientName: "John Doe",
    dispenseDate: "2026-03-11T15:36:46.220Z",
    status: "Paid",
    pharmacistId: "PH-001",
    items: [],
  };
}

function createRefFor(element: HTMLElement): RefObject<HTMLElement | null> {
  return { current: element };
}

describe("useLabelPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("warns when no dispense is selected", async () => {
    const container = document.createElement("div");
    const { result } = renderHook(() =>
      useLabelPdf(null, createRefFor(container))
    );

    await act(async () => {
      await result.current.downloadPdf();
    });

    expect(toastMock.warning).toHaveBeenCalledWith(
      "No Dispense Selected",
      "Please select a dispense first."
    );
  });

  it("renders scoped labels to PDF with balanced canvas scale", async () => {
    const container = document.createElement("div");
    const insideLabel = document.createElement("div");
    insideLabel.className = "print-label";
    insideLabel.textContent = "inside label";
    container.appendChild(insideLabel);

    const outsideLabel = document.createElement("div");
    outsideLabel.className = "print-label";
    outsideLabel.textContent = "outside label";
    document.body.appendChild(outsideLabel);

    const { result } = renderHook(() =>
      useLabelPdf(createLabel(), createRefFor(container))
    );

    await act(async () => {
      await result.current.downloadPdf();
    });

    expect(html2canvasMock).toHaveBeenCalledTimes(1);
    expect(html2canvasMock).toHaveBeenCalledWith(
      insideLabel,
      expect.objectContaining({
        scale: 2,
        backgroundColor: "#ffffff",
      })
    );
    expect(pdfMocks.addImage).toHaveBeenCalledTimes(1);
    expect(pdfMocks.save.mock.calls[0]?.[0]).toMatch(
      /^Medication_Labels_John_Doe_\d{4}-\d{2}-\d{2}\.pdf$/
    );
    expect(toastMock.success).toHaveBeenCalled();

    document.body.removeChild(outsideLabel);
  });
});
