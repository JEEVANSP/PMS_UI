import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LabelGenerationPage from "../components/LabelGeneration";

import type { DispenseLabel, LabelQueueItem } from "../domain";

type QueueListProps = {
  items: LabelQueueItem[];
  selectedId?: string | null;
  onSelect: (dispenseId: string, patientId: string) => void;
};

type LabelPreviewProps = {
  selected: DispenseLabel | null;
  onPrint: () => void;
  onDownload: () => void;
};

const mockPrint = vi.hoisted(() => vi.fn());
const mockDownloadPdf = vi.hoisted(() => vi.fn());
const usePaidDispenseQueueMock = vi.hoisted(() => vi.fn());
const useDispenseLabelMock = vi.hoisted(() => vi.fn());
const useLabelPrintMock = vi.hoisted(() => vi.fn());
const useLabelPdfMock = vi.hoisted(() => vi.fn());

const queueItem: LabelQueueItem = {
  dispenseId: "DSP-001",
  prescriptionId: "RX-001",
  patientId: "P-001",
  patientName: "John Doe",
  dispenseDate: "2026-03-11T15:36:46.220Z",
  status: "Paid",
  itemCount: 1,
  grandTotal: 10,
};

const label: DispenseLabel = {
  dispenseId: "DSP-001",
  prescriptionId: "RX-001",
  patientId: "P-001",
  patientName: "John Doe",
  dispenseDate: "2026-03-11T15:36:46.220Z",
  status: "Paid",
  pharmacistId: "PH-001",
  items: [],
};

vi.mock("@labels/hooks", () => ({
  usePaidDispenseQueue: usePaidDispenseQueueMock,
  useDispenseLabel: useDispenseLabelMock,
  useLabelPrint: useLabelPrintMock,
  useLabelPdf: useLabelPdfMock,
}));

vi.mock("@labels/components/LabelQueueList", () => ({
  LabelQueueList: ({ items, selectedId, onSelect }: QueueListProps) => (
    <div>
      <div data-testid="selected-id">{selectedId ?? "none"}</div>
      <button
        data-testid="select-btn"
        onClick={() => onSelect(items[0].dispenseId, items[0].patientId)}
        type="button"
      >
        Select
      </button>
    </div>
  ),
}));

vi.mock("@labels/components/LabelPreview", () => ({
  LabelPreview: ({ selected, onPrint, onDownload }: LabelPreviewProps) => (
    <div>
      <div data-testid="preview-patient">
        {selected?.patientName ?? "no label"}
      </div>
      <button data-testid="print-btn" onClick={onPrint} type="button">
        Print
      </button>
      <button data-testid="download-btn" onClick={onDownload} type="button">
        Download
      </button>
    </div>
  ),
}));

describe("LabelGenerationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    usePaidDispenseQueueMock.mockReturnValue({
      items: [queueItem],
      loading: false,
      error: null,
    });

    useDispenseLabelMock.mockImplementation(
      (dispenseId: string | null, patientId: string | null) => ({
        label:
          dispenseId === "DSP-001" && patientId === "P-001" ? label : null,
        loading: false,
        error: null,
      })
    );

    useLabelPrintMock.mockReturnValue({
      print: mockPrint,
      isPrinting: false,
    });

    useLabelPdfMock.mockReturnValue({
      downloadPdf: mockDownloadPdf,
      isDownloading: false,
    });
  });

  it("renders header", () => {
    render(<LabelGenerationPage />);

    expect(screen.getByText("Label Generation")).toBeInTheDocument();
  });

  it("loads label details after a queue item is selected", async () => {
    render(<LabelGenerationPage />);

    expect(useDispenseLabelMock).toHaveBeenLastCalledWith(null, null);

    fireEvent.click(screen.getByTestId("select-btn"));

    await waitFor(() => {
      expect(useDispenseLabelMock).toHaveBeenLastCalledWith(
        "DSP-001",
        "P-001"
      );
    });

    expect(screen.getByTestId("selected-id")).toHaveTextContent("DSP-001");
    expect(screen.getByTestId("preview-patient")).toHaveTextContent("John Doe");
  });

  it("passes print and PDF callbacks from hooks", () => {
    render(<LabelGenerationPage />);

    fireEvent.click(screen.getByTestId("print-btn"));
    fireEvent.click(screen.getByTestId("download-btn"));

    expect(mockPrint).toHaveBeenCalledTimes(1);
    expect(mockDownloadPdf).toHaveBeenCalledTimes(1);
  });
});
