import { Outlet, useRouterState } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/app-layout.tsx";
import type { PageId } from "@/lib/routes.ts";
import { PATH_TO_PAGE } from "@/lib/routes.ts";

export function AuthedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentPage: PageId = PATH_TO_PAGE[pathname] ?? "dashboard";

  return (
    <AppLayout currentPage={currentPage}>
      <Outlet />
    </AppLayout>
  );
}
