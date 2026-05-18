import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import DataTable from "@shared/ui/Table/Table";
import type { Column, ServerTableQuery } from "@shared/ui/Table/Table";

import { getPatientById } from "@api/patient";
import { getPrescriptionById } from "@prescription/api";
import { mapDetailsDto } from "@prescription/domain/mapper";
import type {
  PrescriptionDetails,
  PrescriptionSummary,
} from "@prescription/domain/model";
import type { PrescriptionHistoryQueryParams } from "@prescription/api";
import type { PatientDetails } from "@prescription/types/models";

import { usePrescriptionHistory } from "@prescription/hooks/usePrescriptionHistory";
import PrescriptionExpandedDetails from "@prescription/components/PrescriptionExpandedDetails";
import {
  buildHistoryQueryParams,
  formatDateTime,
  statusStyle,
} from "@prescription/utils/prescriptionHistoryUtils";

function usePrescriptionHistoryExpansion(rows: PrescriptionSummary[]) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, PrescriptionDetails>>({});
  const [patientCache, setPatientCache] = useState<Record<string, PatientDetails>>({});
  const [patientLoading, setPatientLoading] = useState<Record<string, boolean>>({});
  const detailsInFlightRef = useRef<Record<string, boolean>>({});
  const patientInFlightRef = useRef<Record<string, boolean>>({});

  const expandedRow = useMemo(() => {
    if (!expandedRowId) {
      return null;
    }
    return rows.find((row) => row.id === expandedRowId) ?? null;
  }, [expandedRowId, rows]);

  const fetchDetails = useCallback(async (row: PrescriptionSummary) => {
    const cacheKey = `${row.id}:${row.patientId}`;

    if (detailsCache[cacheKey] || detailsInFlightRef.current[cacheKey]) {
      return;
    }

    detailsInFlightRef.current[cacheKey] = true;

    try {
      const response = await getPrescriptionById(row.id, row.patientId);
      setDetailsCache((prev) => ({
        ...prev,
        [cacheKey]: mapDetailsDto(response.data),
      }));
    } finally {
      detailsInFlightRef.current[cacheKey] = false;
    }
  }, [detailsCache]);

  const fetchPatient = useCallback(async (patientId: string) => {
    if (patientCache[patientId] || patientInFlightRef.current[patientId]) {
      return;
    }

    patientInFlightRef.current[patientId] = true;
    setPatientLoading((prev) => ({ ...prev, [patientId]: true }));

    try {
      const data = await getPatientById(patientId);
      if (data) {
        setPatientCache((prev) => ({ ...prev, [patientId]: data }));
      }
    } finally {
      patientInFlightRef.current[patientId] = false;
      setPatientLoading((prev) => ({ ...prev, [patientId]: false }));
    }
  }, [patientCache]);

  useEffect(() => {
    if (!expandedRow) {
      return;
    }

    void fetchDetails(expandedRow);
    void fetchPatient(expandedRow.patientId);
  }, [expandedRow, fetchDetails, fetchPatient]);

  const expandedDetailsKey = expandedRow
    ? `${expandedRow.id}:${expandedRow.patientId}`
    : null;

  const expandedDetails =
    expandedDetailsKey ? detailsCache[expandedDetailsKey] ?? null : null;

  const expandedPatient =
    expandedRow ? patientCache[expandedRow.patientId] ?? null : null;

  const expandedPatientLoading =
    expandedRow ? !!patientLoading[expandedRow.patientId] : false;

  const toggleRow = useCallback((rowId: string) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  }, []);

  const isRowExpanded = useCallback(
    (row: PrescriptionSummary) => row.id === expandedRowId,
    [expandedRowId],
  );

  return {
    expandedRowId,
    expandedDetails,
    expandedPatient,
    expandedPatientLoading,
    toggleRow,
    isRowExpanded,
  };
}

export default function PrescriptionHistory() {
  const [query, setQuery] = useState<PrescriptionHistoryQueryParams>({
    pageNumber: 1,
    pageSize: 10,
  });

  const {
    items: prescriptions,
    loading,
    error,
    totalCount,
    pageNumber,
    pageSize,
  } = usePrescriptionHistory(query);

  const {
    expandedRowId,
    expandedDetails,
    expandedPatient,
    expandedPatientLoading,
    toggleRow,
    isRowExpanded,
  } = usePrescriptionHistoryExpansion(prescriptions);

  const columns: Column<PrescriptionSummary>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Prescription ID",
        sortable: true,
        filterable: true,
        width: 180,
        render: (v) => <span className="font-semibold text-gray-900">{String(v)}</span>,
      },
      {
        key: "patientName",
        header: "Patient",
        sortable: true,
        filterable: true,
        width: 220,
        render: (_, row) => (
          <div>
            <div className="font-medium">{row.patientName}</div>
            <div className="text-xs text-gray-500">{row.patientId}</div>
          </div>
        ),
      },
      {
        key: "prescriberName",
        header: "Doctor",
        sortable: true,
        filterable: true,
        width: 200,
      },
      {
        key: "createdAt",
        header: "Date",
        sortable: true,
        filterable: true,
        filterType: "date",
        width: 180,
        render: (v) => {
          const { date, time } = formatDateTime(v as Date);
          return (
            <div>
              <div className="font-medium">{date}</div>
              <div className="text-xs text-gray-500">{time}</div>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "Created", value: "Created" },
          { label: "Active", value: "Active" },
          { label: "Completed", value: "Completed" },
          { label: "Cancelled", value: "Cancelled" },
        ],
        width: 160,
        render: (v) => {
          const statusValue = String(v);
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(statusValue)}`}
            >
              {statusValue}
            </span>
          );
        },
      },
    ],
    []
  );

  const renderExpandedRow = useCallback(
    (row: PrescriptionSummary) => {
      if (expandedRowId !== row.id) return null;

      return (
        <PrescriptionExpandedDetails
          row={row}
          details={expandedDetails}
          patient={expandedPatient}
          patientLoading={expandedPatientLoading}
        />
      );
    },
    [expandedRowId, expandedDetails, expandedPatient, expandedPatientLoading]
  );

  const handleRowClick = useCallback(
    (row: PrescriptionSummary) => toggleRow(row.id),
    [toggleRow]
  );

  const handleServerQueryChange = useCallback(
    (tableQuery: ServerTableQuery) => {
      const apiQuery = buildHistoryQueryParams({
        pageNumber: tableQuery.pageNumber,
        pageSize: tableQuery.pageSize,
        searchTerm: tableQuery.searchTerm,
        sortBy: tableQuery.sortBy,
        sortDirection: tableQuery.sortDirection,
        columnFilters: tableQuery.columnFilters,
      });

      setQuery(apiQuery);
    },
    []
  );

  return (
    <div className="space-y-6">
      

      <div>
        <h1 className="text-2xl font-bold">Prescription History</h1>
        <p className="text-sm text-gray-500">View and track all prescriptions - {totalCount}</p>
      </div>

      <DataTable
        data={prescriptions}
        columns={columns}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search patient name..."
        exportFileName="prescription-history"
        height={650}
        expandable
        renderExpandedRow={renderExpandedRow}
        isRowExpanded={isRowExpanded}
        onRowClick={handleRowClick}
        serverSide
        loading={loading}
        totalItems={totalCount}
        emptyMessage={error ?? "No data available"}
        initialServerQuery={{
          pageNumber,
          pageSize,
        }}
        onServerQueryChange={handleServerQueryChange}
      />
    </div>
  );
}

