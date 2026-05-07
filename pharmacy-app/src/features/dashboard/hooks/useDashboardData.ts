// hooks/useDashboardData.ts
import { useAppSelector } from "@app/store";
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

  // Access items from Redux state (not prescriptions)
  const prescriptions = useAppSelector(
    (state) => state.prescriptions.items || []
  );
  const requestStatus = useAppSelector(
    (state) => state.prescriptions.status || "idle"
  );
  const totalCount = useAppSelector(
    (state) => state.prescriptions.totalCount || 0
  );
  const currentPageNumber = useAppSelector(
    (state) => state.prescriptions.pageNumber || 1
  );
  const currentPageSize = useAppSelector(
    (state) => state.prescriptions.pageSize || pageSize
  );

  return {
    prescriptions,
    requestStatus,
    totalCount,
    pageNumber: currentPageNumber,
    pageSize: currentPageSize,
  };
}
