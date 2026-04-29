import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { MapView } from "./components/MapView";
import { AssetDetail } from "./components/AssetDetail";
import { AuditForm } from "./components/AuditForm";
import { AIRiskDashboard } from "./components/AIRiskDashboard";
import { ReportGeneration } from "./components/ReportGeneration";
import { FutureInfraApproval } from "./components/FutureInfraApproval";
import { AdminPanel } from "./components/AdminPanel";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "map", Component: MapView },
      { path: "assets/:id", Component: AssetDetail },
      { path: "audit", Component: AuditForm },
      { path: "ai-analysis", Component: AIRiskDashboard },
      { path: "reports/:id", Component: ReportGeneration },
      { path: "future-approval", Component: FutureInfraApproval },
      { path: "admin", Component: AdminPanel },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
