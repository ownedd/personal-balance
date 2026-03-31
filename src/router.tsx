import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import type { AuthContextValue } from "@/contexts/auth-types.ts";
import { AuthedLayout } from "@/components/layout/authed-layout.tsx";
import { LoginPage } from "@/pages/login.tsx";
import { RegisterPage } from "@/pages/register.tsx";
import { DashboardPage } from "@/pages/dashboard.tsx";
import { AccountsPage } from "@/pages/accounts.tsx";
import { HistoryPage } from "@/pages/history.tsx";

export interface RouterContext {
  auth: AuthContextValue;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: ({ context }) => {
    if (context.auth.user) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: ({ context }) => {
    if (context.auth.user) throw redirect({ to: "/" });
  },
  component: RegisterPage,
});

const authedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authed",
  beforeLoad: ({ context }) => {
    if (!context.auth.user) throw redirect({ to: "/login" });
  },
  component: AuthedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/",
  component: DashboardPage,
});

const accountsRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/cuentas",
  component: AccountsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/historial",
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  authedLayoutRoute.addChildren([dashboardRoute, accountsRoute, historyRoute]),
]);

export const router = createRouter({
  routeTree,
  context: { auth: undefined! as AuthContextValue },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
