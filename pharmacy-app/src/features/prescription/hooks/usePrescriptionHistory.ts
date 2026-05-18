import { useCallback, useEffect, useState } from "react";
import { getAllPrescriptions } from "@prescription/api";
import { mapSummaryDto } from "@prescription/domain/mapper";
import type { PrescriptionHistoryQueryParams } from "@prescription/api";
import type { PrescriptionSummary } from "@prescription/domain/model";

type State = {
  items: PrescriptionSummary[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  refetch: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to load prescriptions";
}

export function usePrescriptionHistory(
  query: PrescriptionHistoryQueryParams,
): State {
  const [items, setItems] = useState<PrescriptionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(query.pageNumber ?? 1);
  const [pageSize, setPageSize] = useState(query.pageSize ?? 10);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllPrescriptions(query);
      setItems(response.items.map(mapSummaryDto));
      setTotalCount(response.totalCount);
      setPageNumber(response.pageNumber);
      setPageSize(response.pageSize);
      setTotalPages(response.totalPages);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    loading,
    error,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    refetch: load,
  };
}
