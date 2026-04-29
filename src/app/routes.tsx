import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import LoginPage from "@/pages/login";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotFound } from "./components/NotFound";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() =>
  import("./components/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const MapView = lazy(() => import("./components/MapView").then((m) => ({ default: m.MapView })));
const AssetRegistry = lazy(() =>
  import("./components/AssetRegistry").then((m) => ({ default: m.AssetRegistry })),
);
const AssetDetail = lazy(() =>
  import("./components/AssetDetail").then((m) => ({ default: m.AssetDetail })),
);
const AuditForm = lazy(() => import("./components/AuditForm").then((m) => ({ default: m.AuditForm })));
const AIRiskDashboard = lazy(() =>
  import("./components/AIRiskDashboard").then((m) => ({ default: m.AIRiskDashboard })),
);
const ReportGeneration = lazy(() =>
  import("./components/ReportGeneration").then((m) => ({ default: m.ReportGeneration })),
);
const FutureInfraApproval = lazy(() =>
  import("./components/FutureInfraApproval").then((m) => ({ default: m.FutureInfraApproval })),
);
const AdminPanel = lazy(() => import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  { path: "/dashboard", element: <Navigate to="/app" replace /> },
  { path: "/map", element: <Navigate to="/app/map" replace /> },
  { path: "/audit", element: <Navigate to="/app/audit" replace /> },
  { path: "/admin", element: <Navigate to="/app/admin" replace /> },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/app",
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<RouteFallback />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "map",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <MapView />
              </Suspense>
            ),
          },
          {
            path: "assets",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <AssetRegistry />
              </Suspense>
            ),
          },
          {
            path: "assets/:id",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <AssetDetail />
              </Suspense>
            ),
          },
          {
            path: "audit",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <AuditForm />
              </Suspense>
            ),
          },
          {
            path: "ai-analysis",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <AIRiskDashboard />
              </Suspense>
            ),
          },
          {
            path: "reports/:id",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ReportGeneration />
              </Suspense>
            ),
          },
          {
            path: "future-approval",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <FutureInfraApproval />
              </Suspense>
            ),
          },
          {
            path: "admin",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <AdminPanel />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
