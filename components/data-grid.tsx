"use client";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { formatDateRange } from "@/lib/utils";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import { FaPiggyBank } from "react-icons/fa";
import { DataCard, DataCardLoading } from "./data-card";

export const DataGrid = () => {
  const searchParams = useSearchParams();
  const { data, isPending } = useGetSummary();

  const to = searchParams.get("to") || undefined;
  const from = searchParams.get("from") || undefined;

  const dateRangeLabel = formatDateRange({ to, from });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-col-1 lg:grid-cols-3 gap-8 pb-2 mb-2 ">
      <DataCard
        title={"Remaning"}
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={FaPiggyBank}
        variant="default"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={FaArrowTrendUp}
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={FaArrowTrendDown}
        dateRange={dateRangeLabel}
      />
    </div>
  );
};
