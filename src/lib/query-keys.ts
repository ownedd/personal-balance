export const queryKeys = {
  accountsBundle: (userId: string) => ["accounts-bundle", userId] as const,
  transactions: (userId: string, accountId?: string) =>
    ["transactions", userId, accountId ?? "all"] as const,
  snapshots: (userId: string) => ["monthly-snapshots", userId] as const,
  dashboardMonthTx: (userId: string, yearMonth: string) =>
    ["dashboard-month-tx", userId, yearMonth] as const,
  dashboardRecentTx: (userId: string) =>
    ["dashboard-recent-tx", userId] as const,
};
