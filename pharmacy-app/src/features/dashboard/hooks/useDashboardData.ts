// hooks/useDashboardData.ts
import { useCallback, useEffect, useState } from "react";
import { getAllPrescriptions } from "@prescription/api";
import { mapSummaryDto } from "@prescription/domain/mapper";
import type { PrescriptionSummary } from "@prescription/domain/model";

interface UseDashboardDataResult {
  prescriptions: PrescriptionSummary[];
  requestStatus: "idle" | "loading" | "succeeded" | "failed";
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface UseDashboardDataParams {
  pageSize?: number;
}

export function useDashboardData(
  params: UseDashboardDataParams = {}
): UseDashboardDataResult {
  const { pageSize = 10 } = params;
  const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
  const [requestStatus, setRequestStatus] =
    useState<UseDashboardDataResult["requestStatus"]>("idle");
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const load = useCallback(async () => {
    setRequestStatus("loading");

    try {
      const response = await getAllPrescriptions({
        pageNumber: 1,
        pageSize,
        sortBy: "createdAt",
        sortDirection: "desc",
      });

      setPrescriptions(response.items.map(mapSummaryDto));
      setTotalCount(response.totalCount);
      setPageNumber(response.pageNumber);
      setCurrentPageSize(response.pageSize);
      setRequestStatus("succeeded");
    } catch {
      setRequestStatus("failed");
    }
  }, [pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    prescriptions,
    requestStatus,
    totalCount,
    pageNumber,
    pageSize: currentPageSize,
  };
}
