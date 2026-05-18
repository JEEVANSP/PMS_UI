import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import type { ReactNode } from "react";
import type { PatientDetails } from "../types/models";
import type { HistoryTableQuery } from "../utils/prescriptionHistoryUtils";
import type { PrescriptionHistoryQueryParams } from "@prescription/api";
import type { PrescriptionSummary } from "@prescription/domain/model";

const mockUsePrescriptionHistory = vi.fn();

vi.mock("@prescription/hooks/usePrescriptionHistory", () => ({
  usePrescriptionHistory: (query: PrescriptionHistoryQueryParams) =>
    mockUsePrescriptionHistory(query),
}));

vi.mock("@prescription/api", () => ({
  getPrescriptionById: vi.fn().mockResolvedValue({
    data: {
      id: "rx-1",
      patientId: "P-001",
      patientName: "Alice",
      prescriber: { id: "D-001", name: "Dr. Who" },
      prescriberName: "Dr. Who",
      createdAt: "2025-01-01T04:30:00.000Z",
      status: "Active",
      medicineCount: 0,
      medicines: [],
    },
  }),
}));

vi.mock("@api/patient", () => ({
  getPatientById: vi.fn().mockResolvedValue({
    id: "P-001",
    fullName: "Alice A.",
  }),
}));

vi.mock("@prescription/domain/mapper", () => ({
  mapDetailsDto: vi.fn((value) => value),
}));

const formatDateTimeMock = vi.fn((_value: string | Date) => ({
  date: "2025-01-01",
  time: "10:00 AM",
}));
const statusStyleMock = vi.fn((_status: string) => "bg-green-100 text-green-800");
type MappedParams = PrescriptionHistoryQueryParams & { __mapped: boolean };
const buildHistoryQueryParamsMock = vi.fn(
  (q: HistoryTableQuery): MappedParams => ({ ...q, __mapped: true })
);

vi.mock("@prescription/utils/prescriptionHistoryUtils", () => ({
  formatDateTime: (value: string | Date) => formatDateTimeMock(value),
  statusStyle: (status: string) => statusStyleMock(status),
  buildHistoryQueryParams: (query: HistoryTableQuery) =>
    buildHistoryQueryParamsMock(query),
}));

vi.mock("../components/PrescriptionExpandedDetails", () => {
  const Mock = (props: {
    row?: PrescriptionSummary;
    patient?: PatientDetails | null;
    patientLoading?: boolean;
  }) => (
    <div data-testid="expanded-details">
      <div data-testid="expanded-row-id">{props.row?.id}</div>
      <div data-testid="expanded-patient-loading">{String(props.patientLoading)}</div>
      <div data-testid="expanded-patient-name">{props.patient?.fullName ?? ""}</div>
    </div>
  );
  return { default: Mock };
});

type ColumnDef = {
  key: keyof PrescriptionSummary | string;
  render?: (value: unknown, row: PrescriptionSummary) => ReactNode;
};

type DataTableProps = {
  data?: PrescriptionSummary[];
  columns?: ColumnDef[];
  loading?: boolean;
  totalItems?: number;
  initialServerQuery?: { pageNumber?: number; pageSize?: number };
  emptyMessage?: string;
  renderExpandedRow?: (row: PrescriptionSummary) => ReactNode;
  isRowExpanded?: (row: PrescriptionSummary) => boolean;
  onRowClick?: (row: PrescriptionSummary) => void;
  onServerQueryChange?: (query: HistoryTableQuery) => void;
};

vi.mock("@shared/ui/Table/Table", () => {
  const MockDataTable = (props: DataTableProps) => {
    const rows = props.data ?? [];
    const firstRow = rows[0];

    return (
      <div data-testid="datatable">
        <div data-testid="dt-loading">{String(props.loading)}</div>
        <div data-testid="dt-total">{props.totalItems}</div>
        <div data-testid="dt-empty">{props.emptyMessage}</div>
        <div data-testid="dt-initial-page-number">
          {props.initialServerQuery?.pageNumber}
        </div>
        <div data-testid="dt-initial-page-size">
          {props.initialServerQuery?.pageSize}
        </div>

        {firstRow &&
          props.columns?.map((col) => (
            <div key={String(col.key)} data-testid={`col-${String(col.key)}`}>
              {col.render
                ? col.render(firstRow[col.key as keyof PrescriptionSummary], firstRow)
                : String(firstRow[col.key as keyof PrescriptionSummary] ?? "")}
            </div>
          ))}

        {firstRow && (
          <button type="button" onClick={() => props.onRowClick?.(firstRow)}>
            open-row
          </button>
        )}

        {rows.map((row) => (
          <div key={row.id} data-testid={`expanded-for-${row.id}`}>
            {props.isRowExpanded?.(row) && props.renderExpandedRow?.(row)}
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            props.onServerQueryChange?.({
              pageNumber: 3,
              pageSize: 20,
              searchTerm: "ibuprofen",
              sortBy: "createdAt",
              sortDirection: "desc",
              columnFilters: { status: "Active" },
            })
          }
        >
          server-query
        </button>
      </div>
    );
  };

  return { default: MockDataTable };
});

import PrescriptionHistory from "../PrescriptionHistory";

const baseSummary: PrescriptionSummary = {
  id: "rx-1",
  patientId: "P-001",
  patientName: "Alice",
  prescriberName: "Dr. Who",
  createdAt: "2025-01-01T04:30:00.000Z",
  status: "Active",
  medicineCount: 1,
};

describe("PrescriptionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePrescriptionHistory.mockReturnValue({
      items: [baseSummary],
      loading: false,
      error: null,
      totalCount: 42,
      pageNumber: 2,
      pageSize: 10,
      totalPages: 5,
      refetch: vi.fn(),
    });
  });

  it("renders history from the API hook and maps table server queries", () => {
    render(<PrescriptionHistory />);

    expect(screen.getByRole("heading", { name: /prescription history/i })).toBeInTheDocument();
    expect(screen.getByText(/View and track all prescriptions - 42/i)).toBeInTheDocument();
    expect(screen.getByTestId("dt-initial-page-number").textContent).toBe("2");
    expect(screen.getByTestId("dt-initial-page-size").textContent).toBe("10");
    expect(screen.getByTestId("dt-total").textContent).toBe("42");
    expect(screen.getByText("Alice")).toBeInTheDocument();

    expect(formatDateTimeMock).toHaveBeenCalledWith("2025-01-01T04:30:00.000Z");
    expect(statusStyleMock).toHaveBeenCalledWith("Active");

    fireEvent.click(screen.getByRole("button", { name: "server-query" }));

    expect(buildHistoryQueryParamsMock).toHaveBeenCalledWith({
      pageNumber: 3,
      pageSize: 20,
      searchTerm: "ibuprofen",
      sortBy: "createdAt",
      sortDirection: "desc",
      columnFilters: { status: "Active" },
    });
    expect(mockUsePrescriptionHistory).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pageNumber: 3,
        pageSize: 20,
        searchTerm: "ibuprofen",
        sortBy: "createdAt",
        sortDirection: "desc",
        columnFilters: { status: "Active" },
        __mapped: true,
      })
    );
  });

  it("shows loading and error state from the hook", () => {
    mockUsePrescriptionHistory.mockReturnValue({
      items: [],
      loading: true,
      error: "Network error",
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      refetch: vi.fn(),
    });

    render(<PrescriptionHistory />);

    expect(screen.getByTestId("dt-loading").textContent).toBe("true");
    expect(screen.getByTestId("dt-empty").textContent).toBe("Network error");
  });

  it("expands a row through local hook state", async () => {
    render(<PrescriptionHistory />);

    expect(screen.getByTestId("expanded-for-rx-1").textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "open-row" }));

    expect(screen.getByTestId("expanded-details")).toBeInTheDocument();
    expect(screen.getByTestId("expanded-row-id").textContent).toBe("rx-1");
    await waitFor(() => {
      expect(screen.getByTestId("expanded-patient-name").textContent).toBe("Alice A.");
    });
  });
});
