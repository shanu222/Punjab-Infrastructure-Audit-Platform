import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  FileText,
  ScrollText,
  Brain,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { getStoredUser } from "@/utils/authStorage.js";
import * as adminApi from "@/services/adminService.js";
import { fetchAssetById } from "@/services/assetService.js";
import { UserTable, type AdminUserRow } from "@/components/admin/UserTable";
import { AssetTable, type AdminAssetRow } from "@/components/admin/AssetTable";
import { AuditTable, type AdminAuditRow } from "@/components/admin/AuditTable";
import { LogsTable, type AdminLogRow } from "@/components/admin/LogsTable";
import { UploadSection } from "@/components/admin/UploadSection";

const ASSET_TYPES = [
  "building",
  "road",
  "bridge",
  "dam",
  "canal",
  "power",
  "water_supply",
  "other",
] as const;

type TabId = "overview" | "users" | "assets" | "audits" | "standards" | "logs" | "ai";

type UserSortKey = "name" | "email" | "role" | "createdAt" | "is_active";
type AssetSortKey = "display_name" | "type" | "district" | "risk";
type AuditSortKey = "createdAt" | "overall_risk" | "engineer" | "district";
type LogSortKey = "timestamp" | "action" | "user";

export function AdminPanel() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [tab, setTab] = useState<TabId>("overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState<{
    total_users: number;
    total_assets: number;
    total_audits: number;
    high_risk_alerts: number;
  } | null>(null);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userLimit] = useState(20);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchDebounced, setUserSearchDebounced] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"" | "active" | "inactive">("");
  const [userSortKey, setUserSortKey] = useState<UserSortKey>("createdAt");
  const [userSortDir, setUserSortDir] = useState<"asc" | "desc">("desc");

  const [assets, setAssets] = useState<AdminAssetRow[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [assetDistrict, setAssetDistrict] = useState("");
  const [assetPage, setAssetPage] = useState(1);
  const [assetSortKey, setAssetSortKey] = useState<AssetSortKey>("display_name");
  const [assetSortDir, setAssetSortDir] = useState<"asc" | "desc">("asc");
  const ASSET_PAGE_SIZE = 12;

  const [audits, setAudits] = useState<AdminAuditRow[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLimit] = useState(15);
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");
  const [auditEngineer, setAuditEngineer] = useState("");
  const [auditRisk, setAuditRisk] = useState("");
  const [auditStatus, setAuditStatus] = useState("");
  const [auditSortKey, setAuditSortKey] = useState<AuditSortKey>("createdAt");
  const [auditSortDir, setAuditSortDir] = useState<"asc" | "desc">("desc");
  const [engineers, setEngineers] = useState<AdminUserRow[]>([]);

  const [logs, setLogs] = useState<AdminLogRow[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logLimit] = useState(20);
  const [logScope, setLogScope] = useState<"" | "security" | "audits" | "assets">("");
  const [logSearch, setLogSearch] = useState("");
  const [logSearchDebounced, setLogSearchDebounced] = useState("");
  const [logSortKey, setLogSortKey] = useState<LogSortKey>("timestamp");
  const [logSortDir, setLogSortDir] = useState<"asc" | "desc">("desc");

  const [userModal, setUserModal] = useState<"create" | "edit" | null>(null);
  const [userDraft, setUserDraft] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "engineer",
    department: "",
    is_active: true,
  });

  const [assetModal, setAssetModal] = useState<"create" | "edit" | null>(null);
  const [assetDraft, setAssetDraft] = useState({
    id: "",
    type: "building",
    district: "",
    lat: "",
    lng: "",
    construction_year: "",
    material: "",
    structural_type: "",
    risk_score: "",
  });

  const [auditDetailOpen, setAuditDetailOpen] = useState(false);
  const [auditDetail, setAuditDetail] = useState<Record<string, unknown> | null>(null);
  const [auditDetailLoading, setAuditDetailLoading] = useState(false);

  const [aiDataset, setAiDataset] = useState<File | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "training" | "ready" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("Model not trained in this environment (mock).");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/app", { replace: true });
    }
  }, [user?.role, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setUserSearchDebounced(userSearch), 350);
    return () => clearTimeout(t);
  }, [userSearch]);

  useEffect(() => {
    const t = setTimeout(() => setLogSearchDebounced(logSearch), 350);
    return () => clearTimeout(t);
  }, [logSearch]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await adminApi.fetchAdminSummary();
      setSummary(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load summary");
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.fetchUsers({
        page: userPage,
        limit: userLimit,
        search: userSearchDebounced || undefined,
        role: userRoleFilter || undefined,
        status: userStatusFilter || undefined,
        sort: userSortKey,
        order: userSortDir,
      });
      setUsers(
        (data.users || []).map(
          (u: { id: string; name: string; email: string; role: string; department?: string; is_active?: boolean }) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department || "",
            is_active: u.is_active !== false,
          })
        )
      );
      setUserTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [userPage, userLimit, userSearchDebounced, userRoleFilter, userStatusFilter, userSortKey, userSortDir]);

  const loadAssets = useCallback(async () => {
    setAssetsLoading(true);
    setError("");
    try {
      const data = await adminApi.fetchAssetList();
      const rows: AdminAssetRow[] = (data.assets || []).map(
        (a: { _id: string; asset_id?: string; display_name?: string; type: string; district: string; risk_score: number | null; is_flagged_critical?: boolean }) => ({
          asset_id: String(a.asset_id || a._id),
          display_name: a.display_name,
          type: a.type,
          district: a.district,
          risk_score: a.risk_score ?? null,
          is_flagged_critical: Boolean(a.is_flagged_critical),
        })
      );
      setAssets(rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load assets");
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.fetchAudits({
        page: auditPage,
        limit: auditLimit,
        from: auditFrom || undefined,
        to: auditTo || undefined,
        engineer_id: auditEngineer || undefined,
        overall_risk: auditRisk || undefined,
        admin_status: auditStatus || undefined,
      });
      setAudits(data.audits || []);
      setAuditTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load audits");
    } finally {
      setLoading(false);
    }
  }, [auditPage, auditLimit, auditFrom, auditTo, auditEngineer, auditRisk, auditStatus]);

  const loadEngineers = useCallback(async () => {
    try {
      const data = await adminApi.fetchUsers({ role: "engineer", limit: 200, page: 1 });
      setEngineers(
        (data.users || []).map(
          (u: { id: string; name: string; email: string; role: string; department?: string; is_active?: boolean }) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department || "",
            is_active: u.is_active !== false,
          })
        )
      );
    } catch {
      /* optional */
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.fetchLogs({
        page: logPage,
        limit: logLimit,
        scope: logScope || undefined,
        search: logSearchDebounced || undefined,
      });
      setLogs(
        (data.logs || []).map(
          (r: { id: string; user: AdminLogRow["user"]; action: string; entity: string; timestamp: string; ip: string }) => ({
            id: String(r.id),
            user: r.user,
            action: r.action,
            entity: r.entity,
            timestamp: r.timestamp,
            ip: r.ip,
          })
        )
      );
      setLogTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [logPage, logLimit, logScope, logSearchDebounced]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (tab === "users") void loadUsers();
  }, [tab, loadUsers]);

  useEffect(() => {
    if (tab === "assets") void loadAssets();
  }, [tab, loadAssets]);

  useEffect(() => {
    if (tab === "audits") {
      void loadEngineers();
      void loadAudits();
    }
  }, [tab, loadAudits, loadEngineers]);

  useEffect(() => {
    if (tab === "logs") void loadLogs();
  }, [tab, loadLogs]);

  const districts = useMemo(() => {
    const s = new Set<string>();
    assets.forEach((a) => {
      if (a.district) s.add(a.district);
    });
    return Array.from(s).sort();
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const q = assetSearch.trim().toLowerCase();
    return assets.filter((a) => {
      if (assetDistrict && a.district !== assetDistrict) return false;
      if (!q) return true;
      const name = (a.display_name || `${a.type} ${a.district}`).toLowerCase();
      return name.includes(q) || a.type.toLowerCase().includes(q) || a.district.toLowerCase().includes(q);
    });
  }, [assets, assetSearch, assetDistrict]);

  const sortedAssets = useMemo(() => {
    const dir = assetSortDir === "asc" ? 1 : -1;
    const copy = [...filteredAssets];
    copy.sort((a, b) => {
      if (assetSortKey === "risk") {
        const va = a.is_flagged_critical ? 999 : a.risk_score ?? -1;
        const vb = b.is_flagged_critical ? 999 : b.risk_score ?? -1;
        return (va - vb) * dir;
      }
      const ka = assetSortKey === "display_name" ? (a.display_name || `${a.type} ${a.district}`) : String(a[assetSortKey as keyof AdminAssetRow] ?? "");
      const kb = assetSortKey === "display_name" ? (b.display_name || `${b.type} ${b.district}`) : String(b[assetSortKey as keyof AdminAssetRow] ?? "");
      return ka.localeCompare(kb) * dir;
    });
    return copy;
  }, [filteredAssets, assetSortKey, assetSortDir]);

  const pagedAssets = useMemo(() => {
    const start = (assetPage - 1) * ASSET_PAGE_SIZE;
    return sortedAssets.slice(start, start + ASSET_PAGE_SIZE);
  }, [sortedAssets, assetPage]);

  const assetTotalPages = Math.max(1, Math.ceil(sortedAssets.length / ASSET_PAGE_SIZE));

  useEffect(() => {
    setAssetPage(1);
  }, [assetSearch, assetDistrict]);

  const sortedAudits = useMemo(() => {
    const dir = auditSortDir === "asc" ? 1 : -1;
    const copy = [...audits];
    copy.sort((a, b) => {
      if (auditSortKey === "createdAt") {
        return ((new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime())) * dir;
      }
      if (auditSortKey === "overall_risk") {
        return String(a.overall_risk || "").localeCompare(String(b.overall_risk || "")) * dir;
      }
      if (auditSortKey === "engineer") {
        return String(a.engineer_id?.name || "").localeCompare(String(b.engineer_id?.name || "")) * dir;
      }
      return String(a.asset_id?.district || "").localeCompare(String(b.asset_id?.district || "")) * dir;
    });
    return copy;
  }, [audits, auditSortKey, auditSortDir]);

  const sortedLogs = useMemo(() => {
    const dir = logSortDir === "asc" ? 1 : -1;
    const copy = [...logs];
    copy.sort((a, b) => {
      if (logSortKey === "timestamp") {
        return ((new Date(a.timestamp).getTime()) - (new Date(b.timestamp).getTime())) * dir;
      }
      if (logSortKey === "action") {
        return a.action.localeCompare(b.action) * dir;
      }
      return (a.user?.name || "").localeCompare(b.user?.name || "") * dir;
    });
    return copy;
  }, [logs, logSortKey, logSortDir]);

  function toggleUserSort(key: UserSortKey) {
    if (userSortKey === key) setUserSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setUserSortKey(key);
      setUserSortDir(key === "createdAt" || key === "is_active" ? "desc" : "asc");
    }
    setUserPage(1);
  }

  function toggleAssetSort(key: AssetSortKey) {
    if (assetSortKey === key) setAssetSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setAssetSortKey(key);
      setAssetSortDir(key === "risk" ? "desc" : "asc");
    }
  }

  function toggleAuditSort(key: AuditSortKey) {
    if (auditSortKey === key) setAuditSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setAuditSortKey(key);
      setAuditSortDir(key === "createdAt" ? "desc" : "asc");
    }
  }

  function toggleLogSort(key: LogSortKey) {
    if (logSortKey === key) setLogSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setLogSortKey(key);
      setLogSortDir(key === "timestamp" ? "desc" : "asc");
    }
  }

  async function handleDeleteUser(u: AdminUserRow) {
    if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    setError("");
    try {
      await adminApi.deleteUser(u.id);
      await loadUsers();
      await loadSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleToggleUser(u: AdminUserRow) {
    setError("");
    try {
      await adminApi.updateUser(u.id, { is_active: !u.is_active });
      await loadUsers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function submitUserModal() {
    setError("");
    try {
      if (userModal === "create") {
        await adminApi.createUser({
          name: userDraft.name,
          email: userDraft.email,
          password: userDraft.password,
          role: userDraft.role,
          department: userDraft.department,
          is_active: userDraft.is_active,
        });
      } else if (userModal === "edit" && userDraft.id) {
        const body: Record<string, unknown> = {
          role: userDraft.role,
          is_active: userDraft.is_active,
          name: userDraft.name,
          department: userDraft.department,
        };
        if (userDraft.password.trim()) body.password = userDraft.password;
        await adminApi.updateUser(userDraft.id, body);
      }
      setUserModal(null);
      await loadUsers();
      await loadSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDeleteAsset(a: AdminAssetRow) {
    if (
      !window.confirm(
        `Delete this asset and all linked audits for ${a.display_name || a.district}? This cannot be undone.`
      )
    ) {
      return;
    }
    setError("");
    try {
      await adminApi.deleteAsset(a.asset_id);
      await loadAssets();
      await loadSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function submitAssetModal() {
    setError("");
    const lat = Number(assetDraft.lat);
    const lng = Number(assetDraft.lng);
    if (!assetDraft.district.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("District and valid coordinates are required.");
      return;
    }
    const payload: Record<string, unknown> = {
      type: assetDraft.type,
      district: assetDraft.district.trim(),
      location: { lat, lng },
    };
    if (assetDraft.construction_year) payload.construction_year = Number(assetDraft.construction_year);
    if (assetDraft.material) payload.material = assetDraft.material;
    if (assetDraft.structural_type) payload.structural_type = assetDraft.structural_type;
    if (assetDraft.risk_score !== "") payload.risk_score = Number(assetDraft.risk_score);
    try {
      if (assetModal === "create") {
        await adminApi.createAsset(payload);
      } else if (assetModal === "edit" && assetDraft.id) {
        await adminApi.updateAsset(assetDraft.id, payload);
      }
      setAssetModal(null);
      await loadAssets();
      await loadSummary();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save asset failed");
    }
  }

  async function openAuditView(a: AdminAuditRow) {
    setAuditDetailOpen(true);
    setAuditDetail(null);
    setAuditDetailLoading(true);
    try {
      const detail = await adminApi.fetchAuditDetail(a._id);
      setAuditDetail((detail as { audit?: Record<string, unknown> }).audit ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load audit");
    } finally {
      setAuditDetailLoading(false);
    }
  }

  async function patchAuditStatus(a: AdminAuditRow, status: "approved" | "flagged" | "pending") {
    setError("");
    try {
      await adminApi.updateAuditAdminStatus(a._id, { admin_status: status });
      await loadAudits();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  function openCreateUser() {
    setUserDraft({
      id: "",
      name: "",
      email: "",
      password: "",
      role: "engineer",
      department: "",
      is_active: true,
    });
    setUserModal("create");
  }

  function openEditUser(u: AdminUserRow) {
    setUserDraft({
      id: u.id,
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      department: u.department || "",
      is_active: u.is_active,
    });
    setUserModal("edit");
  }

  function openCreateAsset() {
    setAssetDraft({
      id: "",
      type: "building",
      district: "",
      lat: "31.5204",
      lng: "74.3587",
      construction_year: "",
      material: "",
      structural_type: "",
      risk_score: "",
    });
    setAssetModal("create");
  }

  function openEditAsset(a: AdminAssetRow) {
    setAssetDraft({
      id: a.asset_id,
      type: a.type,
      district: a.district,
      lat: "",
      lng: "",
      construction_year: "",
      material: "",
      structural_type: "",
      risk_score: a.risk_score != null ? String(a.risk_score) : "",
    });
    setAssetModal("edit");
  }

  useEffect(() => {
    if (assetModal === "edit" && assetDraft.id) {
      void (async () => {
        try {
          const res = (await fetchAssetById(assetDraft.id)) as { data?: { asset?: Record<string, unknown> } };
          const raw = res.data?.asset;
          if (raw?.location && typeof raw.location === "object") {
            const loc = raw.location as { lat?: number; lng?: number };
            setAssetDraft((d) => ({
              ...d,
              lat: loc.lat != null ? String(loc.lat) : d.lat,
              lng: loc.lng != null ? String(loc.lng) : d.lng,
              construction_year: raw.construction_year != null ? String(raw.construction_year) : "",
              material: String(raw.material || ""),
              structural_type: String(raw.structural_type || ""),
            }));
          }
        } catch {
          /* ignore */
        }
      })();
    }
  }, [assetModal, assetDraft.id]);

  const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "assets", label: "Infrastructure", icon: Building2 },
    { id: "audits", label: "Audits", icon: ClipboardList },
    { id: "standards", label: "Standards", icon: FileText },
    { id: "logs", label: "System logs", icon: ScrollText },
    { id: "ai", label: "AI (mock)", icon: Brain },
  ];

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Admin control center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Punjab Infrastructure Audit Intelligence Platform — users, assets, audits, and activity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSummary()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh summary
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 rounded-lg whitespace-nowrap text-sm font-medium flex items-center gap-2 shrink-0 transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total users", value: summary?.total_users ?? "—", icon: Users },
            { label: "Total assets", value: summary?.total_assets ?? "—", icon: Building2 },
            { label: "Total audits", value: summary?.total_audits ?? "—", icon: ClipboardList },
            { label: "High-risk alerts", value: summary?.high_risk_alerts ?? "—", icon: AlertTriangle, warn: true },
          ].map((c) => (
            <div
              key={c.label}
              className={`rounded-xl border p-5 ${c.warn ? "border-orange-500/40 bg-orange-500/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <c.icon className={`w-5 h-5 ${c.warn ? "text-orange-600" : "text-primary"}`} />
              </div>
              <p className="text-3xl font-semibold tabular-nums">{c.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {tab === "users" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Search</label>
              <input
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Name, email, department"
                className="px-3 py-2 rounded-lg border border-border bg-input-background min-w-[200px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Role</label>
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-border bg-input-background"
              >
                <option value="">All</option>
                <option value="admin">admin</option>
                <option value="engineer">engineer</option>
                <option value="government">government</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value as "" | "active" | "inactive");
                  setUserPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-border bg-input-background"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <UserTable
            users={users}
            loading={loading}
            sortKey={userSortKey}
            sortDir={userSortDir}
            onSort={toggleUserSort}
            onAdd={openCreateUser}
            onEdit={openEditUser}
            onToggle={handleToggleUser}
            onDelete={handleDeleteUser}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {userPage} · {userTotal} users
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={userPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={userPage * userLimit >= userTotal}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setUserPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "assets" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              placeholder="Search assets…"
              className="px-3 py-2 rounded-lg border border-border bg-input-background flex-1 min-w-[180px]"
            />
            <select
              value={assetDistrict}
              onChange={(e) => setAssetDistrict(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            >
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <AssetTable
            assets={pagedAssets}
            loading={assetsLoading}
            sortKey={assetSortKey}
            sortDir={assetSortDir}
            onSort={toggleAssetSort}
            onAdd={openCreateAsset}
            onEdit={openEditAsset}
            onDelete={handleDeleteAsset}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(assetPage - 1) * ASSET_PAGE_SIZE + 1}–
              {Math.min(assetPage * ASSET_PAGE_SIZE, sortedAssets.length)} of {sortedAssets.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={assetPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={assetPage >= assetTotalPages}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setAssetPage((p) => Math.min(assetTotalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "audits" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
            <input
              type="date"
              value={auditFrom}
              onChange={(e) => {
                setAuditFrom(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            />
            <input
              type="date"
              value={auditTo}
              onChange={(e) => {
                setAuditTo(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            />
            <select
              value={auditEngineer}
              onChange={(e) => {
                setAuditEngineer(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            >
              <option value="">All engineers</option>
              {engineers.map((en) => (
                <option key={en.id} value={en.id}>
                  {en.name}
                </option>
              ))}
            </select>
            <select
              value={auditRisk}
              onChange={(e) => {
                setAuditRisk(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            >
              <option value="">All risk levels</option>
              <option value="SAFE">SAFE</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <select
              value={auditStatus}
              onChange={(e) => {
                setAuditStatus(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            >
              <option value="">Review status</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="flagged">flagged</option>
            </select>
          </div>

          <AuditTable
            audits={sortedAudits}
            loading={loading}
            sortKey={auditSortKey}
            sortDir={auditSortDir}
            onSort={toggleAuditSort}
            onView={openAuditView}
            onApprove={(a) => void patchAuditStatus(a, "approved")}
            onFlag={(a) => void patchAuditStatus(a, "flagged")}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {auditPage} · {auditTotal} audits
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={auditPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={auditPage * auditLimit >= auditTotal}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setAuditPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>

          {auditDetailOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
              <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-auto p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Audit detail</h3>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setAuditDetailOpen(false)}
                  >
                    Close
                  </button>
                </div>
                {auditDetailLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {!auditDetailLoading && auditDetail && (
                  <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(auditDetail, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {tab === "standards" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <UploadSection
            disabled={loading}
            onUpload={async (file) => {
              await adminApi.uploadStandardsDocument(file);
              await loadSummary();
            }}
          />
        </motion.div>
      )}

      {tab === "logs" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={logSearch}
              onChange={(e) => {
                setLogSearch(e.target.value);
                setLogPage(1);
              }}
              placeholder="Search action / entity"
              className="px-3 py-2 rounded-lg border border-border bg-input-background flex-1 min-w-[200px]"
            />
            <select
              value={logScope}
              onChange={(e) => {
                setLogScope(e.target.value as typeof logScope);
                setLogPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-border bg-input-background"
            >
              <option value="">All categories</option>
              <option value="security">Login & security</option>
              <option value="audits">Audits</option>
              <option value="assets">Assets</option>
            </select>
          </div>

          <LogsTable logs={sortedLogs} loading={loading} sortKey={logSortKey} sortDir={logSortDir} onSort={toggleLogSort} />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {logPage} · {logTotal} entries
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={logPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={logPage * logLimit >= logTotal}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
                onClick={() => setLogPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "ai" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-xl">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Dataset (mock)</h3>
            <input
              type="file"
              accept=".csv,.json,.xlsx,application/json,text/csv"
              onChange={(e) => setAiDataset(e.target.files?.[0] || null)}
              className="text-sm"
            />
            {aiDataset && <p className="text-xs text-muted-foreground">Selected: {aiDataset.name}</p>}
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Training</h3>
            <p className="text-sm text-muted-foreground">{aiMessage}</p>
            <button
              type="button"
              disabled={aiStatus === "training"}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              onClick={() => {
                setAiStatus("training");
                setAiMessage("Training job queued (mock)…");
                setTimeout(() => {
                  setAiStatus("ready");
                  setAiMessage("Model status: ready (mock). No server-side training is wired yet.");
                }, 2000);
              }}
            >
              {aiStatus === "training" ? "Training…" : "Train model"}
            </button>
            <div className="text-xs">
              Status: <span className="font-mono uppercase">{aiStatus}</span>
            </div>
          </div>
        </motion.div>
      )}

      {(userModal || assetModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {userModal && (
              <>
                <h3 className="font-semibold text-lg">{userModal === "create" ? "Create user" : "Edit user"}</h3>
                <label className="block text-xs text-muted-foreground">Name</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={userDraft.name}
                  onChange={(e) => setUserDraft((d) => ({ ...d, name: e.target.value }))}
                />
                <label className="block text-xs text-muted-foreground">Email</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={userDraft.email}
                  onChange={(e) => setUserDraft((d) => ({ ...d, email: e.target.value }))}
                  disabled={userModal === "edit"}
                />
                <label className="block text-xs text-muted-foreground">Department</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={userDraft.department}
                  onChange={(e) => setUserDraft((d) => ({ ...d, department: e.target.value }))}
                />
                <label className="block text-xs text-muted-foreground">
                  Password {userModal === "edit" ? "(leave blank to keep)" : ""}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={userDraft.password}
                  onChange={(e) => setUserDraft((d) => ({ ...d, password: e.target.value }))}
                />
                <label className="block text-xs text-muted-foreground">Role</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={userDraft.role}
                  onChange={(e) => setUserDraft((d) => ({ ...d, role: e.target.value }))}
                >
                  <option value="engineer">engineer</option>
                  <option value="government">government</option>
                  <option value="admin">admin</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={userDraft.is_active}
                    onChange={(e) => setUserDraft((d) => ({ ...d, is_active: e.target.checked }))}
                  />
                  Active
                </label>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" className="px-4 py-2 rounded-lg border border-border" onClick={() => setUserModal(null)}>
                    Cancel
                  </button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground" onClick={() => void submitUserModal()}>
                    Save
                  </button>
                </div>
              </>
            )}
            {assetModal && (
              <>
                <h3 className="font-semibold text-lg">{assetModal === "create" ? "Add asset" : "Edit asset"}</h3>
                <label className="block text-xs text-muted-foreground">Type</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={assetDraft.type}
                  onChange={(e) => setAssetDraft((d) => ({ ...d, type: e.target.value }))}
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <label className="block text-xs text-muted-foreground">District</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={assetDraft.district}
                  onChange={(e) => setAssetDraft((d) => ({ ...d, district: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground">Latitude</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                      value={assetDraft.lat}
                      onChange={(e) => setAssetDraft((d) => ({ ...d, lat: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Longitude</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                      value={assetDraft.lng}
                      onChange={(e) => setAssetDraft((d) => ({ ...d, lng: e.target.value }))}
                    />
                  </div>
                </div>
                <label className="block text-xs text-muted-foreground">Construction year (optional)</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={assetDraft.construction_year}
                  onChange={(e) => setAssetDraft((d) => ({ ...d, construction_year: e.target.value }))}
                />
                <label className="block text-xs text-muted-foreground">Material (optional)</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={assetDraft.material}
                  onChange={(e) => setAssetDraft((d) => ({ ...d, material: e.target.value }))}
                />
                <label className="block text-xs text-muted-foreground">Structural type (optional)</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={assetDraft.structural_type}
                  onChange={(e) => setAssetDraft((d) => ({ ...d, structural_type: e.target.value }))}
                />
                <label className="block text-xs text-muted-foreground">Risk score 0–100 (optional)</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background"
                  value={assetDraft.risk_score}
                  onChange={(e) => setAssetDraft((d) => ({ ...d, risk_score: e.target.value }))}
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" className="px-4 py-2 rounded-lg border border-border" onClick={() => setAssetModal(null)}>
                    Cancel
                  </button>
                  <button type="button" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground" onClick={() => void submitAssetModal()}>
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
