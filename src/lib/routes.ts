export type PageId = "dashboard" | "accounts" | "history";

export const PAGE_PATHS: Record<PageId, string> = {
  dashboard: "/",
  accounts: "/cuentas",
  history: "/historial",
};

export const PATH_TO_PAGE: Record<string, PageId> = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page as PageId])
);
