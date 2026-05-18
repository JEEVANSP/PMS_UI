import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getPaymentSummary,
  getPaymentTrend,
  getPaymentModeBreakdown,
  getPaymentTransactions,
  type Period,
  type PaymentKpiSummaryDto,
  type PaymentStatus,
  type PaymentTransactionsResponseDto,
  type PaymentTransactionsQuery,
  type PaymentTransactionItemDto,
} from "@api/payments.api";
import type { ServerTableQuery } from "@shared/ui/Table/Table";

const toISODate = (value: string) => {
  const t = value.indexOf("T");
  return t > 0 ? value.slice(0, t) : value;
};

type DashboardSortKey =
  "id" | "patientname" | "rxid" | "amount" | "mode" | "status" | "timestamp";

type DashboardSummary = Pick<
  PaymentKpiSummaryDto,
  | "totalCollected"
  | "patientCollected"
  | "insuranceCollected"
  | "totalPending"
  | "pendingCount"
> & {
  vs: {
    totalCollectedDeltaPct: number;
    patientCollectedDeltaPct: number;
    insuranceCollectedDeltaPct: number;
    pendingDeltaPct: number;
  };
};

type TrendDatum = {
  day: string;
  patient: number;
  insurance: number;
};

type ModeDatum = {
  name: string;
  value: number;
};

const SORT_MAP: Record<string, DashboardSortKey> = {
  id: "id",
  patientName: "patientname",
  rxId: "rxid",
  amount: "amount",
  mode: "mode",
  status: "status",
  timestamp: "timestamp",
};

export function usePaymentDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");

  // KPI summary
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Trend data
  const [trendData, setTrendData] = useState<TrendDatum[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // Mode breakdown (donut)
  const [modeData, setModeData] = useState<ModeDatum[]>([]);
  const [modeLoading, setModeLoading] = useState(false);

  // Transactions table
  const [tableRows, setTableRows] = useState<PaymentTransactionItemDto[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const initialQuery: ServerTableQuery = {
    pageNumber: 1,
    pageSize: 8,
    searchTerm: "",
    sortBy: "timestamp",
    sortDirection: "desc",
    columnFilters: {},
  };

  // Fetch KPI summary
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setSummaryLoading(true);
        const res = await getPaymentSummary(selectedPeriod);
        if (!mounted) return;

        setSummary({
          totalCollected: Number(res.totalCollected),
          patientCollected: Number(res.patientCollected),
          insuranceCollected: Number(res.insuranceCollected),
          totalPending: Number(res.totalPending),
          pendingCount: res.pendingCount,
          vs: {
            totalCollectedDeltaPct: Number(res.vsPrevious?.totalCollectedDeltaPct ?? 0),
            patientCollectedDeltaPct: Number(res.vsPrevious?.patientCollectedDeltaPct ?? 0),
            insuranceCollectedDeltaPct: Number(res.vsPrevious?.insuranceCollectedDeltaPct ?? 0),
            pendingDeltaPct: Number(res.vsPrevious?.pendingDeltaPct ?? 0),
          },
        });
      } finally {
        setSummaryLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedPeriod]);

  // Fetch trend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setTrendLoading(true);
        const res = await getPaymentTrend(selectedPeriod);
        if (!mounted) return;
        setTrendData(
          (res.data ?? []).map((p) => ({
            day: p.label,
            patient: Number(p.patient),
            insurance: Number(p.insurance),
          }))
        );
      } finally {
        setTrendLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedPeriod]);

  // Fetch mode breakdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setModeLoading(true);
        const res = await getPaymentModeBreakdown(selectedPeriod, "Patient");
        if (!mounted) return;
        setModeData(
          (res.breakdown ?? []).map((b) => ({
            name: b.mode,
            value: Number(b.amount),
          }))
        );
      } finally {
        setModeLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedPeriod]);

  // Handle table server-side query
  const handleServerQueryChange = useCallback(async (q: ServerTableQuery) => {
    try {
      setTableLoading(true);

      const sortKey = SORT_MAP[String(q.sortBy)] ?? "timestamp";
      const sortDir = q.sortDirection ?? "desc";

      const rawStatus = q.columnFilters["status"] || "all";
      const status: PaymentTransactionsQuery["status"] =
        rawStatus === "Cleared" || rawStatus === "Pending" || rawStatus === "Failed"
          ? (rawStatus as PaymentStatus)
          : "all";
      const rawMode = q.columnFilters["mode"] || "all";
      const mode: PaymentTransactionsQuery["mode"] =
        rawMode === "Cash" ||
        rawMode === "UPI" ||
        rawMode === "Card" ||
        rawMode === "Bank Transfer" ||
        rawMode === "Insurance"
          ? rawMode
          : "all";

      const filterDate = q.columnFilters["timestamp"]
        ? toISODate(q.columnFilters["timestamp"])
        : "";

      const res: PaymentTransactionsResponseDto = await getPaymentTransactions({
        page: q.pageNumber,
        pageSize: q.pageSize,
        search: q.searchTerm,
        status,
        mode,
        sortKey,
        sortDir,
        dateFrom: filterDate || undefined,
        dateTo: filterDate || undefined,
      });

      setTableRows(res.data ?? []);
      setTableTotal(res.pagination?.total ?? 0);
    } finally {
      setTableLoading(false);
    }
  }, []);

  const patientTotal = useMemo(
    () => modeData.reduce((sum, d) => sum + d.value, 0),
    [modeData]
  );

  return {
    selectedPeriod,
    setSelectedPeriod,

    summary,
    summaryLoading,

    trendData,
    trendLoading,

    modeData,
    modeLoading,
    patientTotal,

    tableRows,
    tableTotal,
    tableLoading,

    initialQuery,
    handleServerQueryChange,
  };
}

