import React from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Shield,
  Smartphone,
  User,
} from "lucide-react";

import DataTable from "@shared/ui/Table/Table";
import type { Column } from "@shared/ui/Table/Table";
import type { PaymentTransactionItemDto } from "@api/payments.api";

import { usePaymentDashboard } from "../hooks/usePaymentDashboard";

const MODE_META = {
  Cash: {
    badge: "bg-emerald-100 text-emerald-700",
    icon: <Banknote className="w-3.5 h-3.5" />,
  },
  UPI: {
    badge: "bg-purple-100 text-purple-700",
    icon: <Smartphone className="w-3.5 h-3.5" />,
  },
  Card: {
    badge: "bg-blue-100 text-blue-700",
    icon: <CreditCard className="w-3.5 h-3.5" />,
  },
  "Bank Transfer": {
    badge: "bg-orange-100 text-orange-700",
    icon: <Building2 className="w-3.5 h-3.5" />,
  },
  Insurance: {
    badge: "bg-cyan-100 text-cyan-700",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
} as const;

type ModeName = keyof typeof MODE_META;
type DeltaSnapshot = {
  totalCollectedDeltaPct: number;
  patientCollectedDeltaPct: number;
  insuranceCollectedDeltaPct: number;
};

function ModeBadge({ mode }: { mode: string }) {
  const badge =
    mode in MODE_META
      ? MODE_META[mode as ModeName]
      : MODE_META.Cash;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${badge.badge}`}>
      {badge.icon} {mode}
    </span>
  );
}

function StatusBadge({ status }: { status: PaymentTransactionItemDto["status"] }) {
  if (status === "Cleared") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="w-3 h-3" /> Cleared
      </span>
    );
  }

  if (status === "Failed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function PaymentDashboard() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    summary,
    summaryLoading,
    tableRows,
    tableTotal,
    tableLoading,
    initialQuery,
    handleServerQueryChange,
  } = usePaymentDashboard();

  const kpiCards = React.useMemo(() => {
    const formatCurrency = (value: number) =>
      `$${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const formatDelta = (value?: number) =>
      value === undefined ? undefined : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

    const totalCollected = summary?.totalCollected ?? 0;
    const patientCollected = summary?.patientCollected ?? 0;
    const insuranceCollected = summary?.insuranceCollected ?? 0;
    const totalPending = summary?.totalPending ?? 0;
    const pendingCount = summary?.pendingCount ?? 0;
    const deltas: DeltaSnapshot = summary?.vs ?? {
      totalCollectedDeltaPct: 0,
      patientCollectedDeltaPct: 0,
      insuranceCollectedDeltaPct: 0,
    };

    return [
      {
        label: "Total Collected",
        value: formatCurrency(totalCollected),
        sub: "All cleared payments",
        icon: DollarSign,
        color: "bg-blue-50 text-blue-600",
        delta: formatDelta(deltas.totalCollectedDeltaPct),
        deltaDir: deltas.totalCollectedDeltaPct >= 0 ? "up" : "down",
      },
      {
        label: "Patient Payments",
        value: formatCurrency(patientCollected),
        sub: `${Math.round((patientCollected / (totalCollected || 1)) * 100)}% of total`,
        icon: User,
        color: "bg-blue-50 text-blue-600",
        delta: formatDelta(deltas.patientCollectedDeltaPct),
        deltaDir: deltas.patientCollectedDeltaPct >= 0 ? "up" : "down",
      },
      {
        label: "Insurance Claims",
        value: formatCurrency(insuranceCollected),
        sub: `${Math.round((insuranceCollected / (totalCollected || 1)) * 100)}% of total`,
        icon: Shield,
        color: "bg-cyan-50 text-cyan-600",
        delta: formatDelta(deltas.insuranceCollectedDeltaPct),
        deltaDir: deltas.insuranceCollectedDeltaPct >= 0 ? "up" : "down",
      },
      {
        label: "Pending",
        value: formatCurrency(totalPending),
        sub: `${pendingCount} transactions`,
        icon: Clock,
        color: "bg-amber-50 text-amber-600",
      },
    ];
  }, [summary]);

  const columns = React.useMemo<Column<PaymentTransactionItemDto>[]>(
    () => [
      {
        key: "id",
        header: "Payment ID",
        sortable: true,
        filterable: true,
        render: (_value, row) => (
          <div>
            <div className="font-mono text-xs font-semibold">{row.id}</div>
            {row.type === "Insurance" && row.insurerName && (
              <div className="text-xs text-cyan-600 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {row.insurerName}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "patientName",
        header: "Patient",
        sortable: true,
        filterable: true,
        render: (_value, row) => (
          <div>
            <div className="font-medium flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  row.type === "Insurance" ? "bg-cyan-500" : "bg-blue-500"
                }`}
              >
                {row.patientName
                  .split(" ")
                  .map((part) => part[0] ?? "")
                  .join("")
                  .slice(0, 2)}
              </div>
              {row.patientName}
            </div>
            <div className="text-xs text-gray-400 ml-7.5">{row.patientId}</div>
          </div>
        ),
      },
      {
        key: "rxId",
        header: "RX ID",
        sortable: true,
        filterable: true,
        render: (value) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        key: "amount",
        header: "Amount",
        sortable: true,
        render: (_value, row) => <span className="font-semibold">${row.amount.toFixed(2)}</span>,
      },
      {
        key: "mode",
        header: "Mode",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: ["Cash", "UPI", "Card", "Bank Transfer", "Insurance"],
        render: (_value, row) => <ModeBadge mode={row.mode} />,
      },
      {
        key: "transactionId",
        header: "Transaction ID",
        filterable: true,
        render: (_value, row) =>
          row.transactionId ? (
            <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded border">
              {row.transactionId}
            </span>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        filterType: "select",
        filterOptions: ["Cleared", "Pending", "Failed"],
        render: (_value, row) => <StatusBadge status={row.status} />,
      },
      {
        key: "timestamp",
        header: "Date & Time",
        sortable: true,
        filterable: true,
        filterType: "date",
        render: (_value, row) => (
          <div className="text-xs">
            <div className="text-gray-700">
              {new Date(row.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-gray-400">
              {new Date(row.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-gray-900">Payment Dashboard</h1>
          <p className="text-gray-500">Revenue overview and transaction history</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {(["today", "week", "month"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedPeriod === period ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                }`}
              >
                {period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          <button className="px-4 py-2 bg-white border rounded-xl text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white border rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>

              {card.delta && (
                <div
                  className={`flex items-center text-xs ${
                    card.deltaDir === "up" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {card.deltaDir === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {card.delta}
                </div>
              )}
            </div>

            <div className="text-xl font-bold text-gray-900">
              {summaryLoading ? "-" : card.value}
            </div>
            <div className="text-sm text-gray-600">{card.label}</div>
            <div className="text-xs text-gray-400">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-800">All Transactions</h3>
        </div>

        <p className="text-sm text-gray-400 mb-5">
          Complete payment record sortable, filterable, paginated
        </p>

        <DataTable
          data={tableRows}
          columns={columns}
          pageSize={8}
          pageSizeOptions={[8, 15, 30]}
          searchable
          searchPlaceholder="Search by ID, patient, RX, transaction..."
          exportFileName="transactions"
          emptyMessage="No transactions found"
          rowClassName={(_row, index) => (index % 2 === 1 ? "bg-gray-50/30" : "")}
          serverSide
          loading={tableLoading}
          totalItems={tableTotal}
          initialServerQuery={initialQuery}
          onServerQueryChange={handleServerQueryChange}
        />
      </div>
    </div>
  );
}

