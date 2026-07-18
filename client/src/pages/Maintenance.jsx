import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings, Cpu, Database, Home, LogOut, RefreshCw,
  AlertTriangle, Sparkles, Loader2, CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

const MaintenancePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, healthRes] = await Promise.all([
        api.get("/api/settings/maintenance-status"),
        api.get("/api/settings/health"),
      ]);
      setStatus(statusRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      console.error("Failed to fetch maintenance status:", err);
      // If even the status check fails, assume the system is genuinely down —
      // show the page rather than crash on it.
      setStatus({ enabled: true, message: "Unable to reach the platform.", startedAt: null, estimatedEndAt: null });
      setHealth({ database: "Unreachable", aiCopilotService: "Unreachable" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const pollInterval = setInterval(fetchStatus, 15000); // re-check every 15s
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(pollInterval); clearInterval(clock); };
  }, [fetchStatus]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReturnHome = () => navigate("/dashboard");

  const handleSignOut = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout request failed (clearing local session anyway):", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-2 text-[#4D4C7D]">
        <Loader2 size={20} className="animate-spin" /> Checking platform status...
      </div>
    );
  }

  const startedAt = status?.startedAt ? new Date(status.startedAt).getTime() : null;
  const estimatedEndAt = status?.estimatedEndAt ? new Date(status.estimatedEndAt).getTime() : null;

  const progress = startedAt && estimatedEndAt && estimatedEndAt > startedAt
    ? Math.min(100, Math.max(0, Math.round(((now - startedAt) / (estimatedEndAt - startedAt)) * 100)))
    : null;

  const remainingSeconds = estimatedEndAt ? Math.max(0, Math.floor((estimatedEndAt - now) / 1000)) : null;

  // Maintenance mode is actually off — don't show a fake outage screen
  if (!status?.enabled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
          <h1 className="text-xl font-black text-[#363062]">All Systems Operational</h1>
          <p className="text-xs text-[#4D4C7D] font-semibold">No maintenance window is currently active.</p>
          <button
            onClick={handleReturnHome}
            className="bg-[#363062] hover:bg-[#4D4C7D] text-white px-5 py-3 rounded-xl font-bold text-xs transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const subsystems = [
    { label: "Database Layer", state: health?.database || "Checking...", icon: Database, ok: health?.database === "Operational" },
    { label: "AI Copilot Service", state: health?.aiCopilotService || "Checking...", icon: Cpu, ok: health?.aiCopilotService === "Operational" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans antialiased text-slate-800">

      <div className="w-full max-w-2xl bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/30 via-[#4D4C7D]/10 to-[#363062]/30 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFCFEE]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-white rounded-[22px] p-6 lg:p-10 text-center relative z-10 space-y-8">

          <div className="flex justify-center">
            <div className="relative h-24 w-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-[#DFCFEE]/40 animate-ping opacity-75" />
              <div className="absolute inset-2 rounded-2xl bg-[#4D4C7D]/10 animate-pulse" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#363062] to-[#4D4C7D] text-white flex items-center justify-center shadow-lg">
                <Settings size={28} className="animate-spin [animation-duration:12s]" />
              </div>
              <Sparkles size={16} className="absolute top-1 right-1 text-[#4D4C7D]" />
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider ring-1 ring-amber-500/10">
              <AlertTriangle size={11} /> Platform Node Status: Maintenance Active
            </span>
            <h1 className="text-3xl font-black text-[#363062] tracking-tight">
              Platform Re-Calibration In Progress
            </h1>
            <p className="text-xs font-semibold text-[#4D4C7D]/80 leading-relaxed">
              {status?.message || "The platform is currently undergoing scheduled maintenance."}
            </p>
          </div>

          <div className="bg-slate-50 border border-[#363062]/10 rounded-2xl p-5 space-y-4 max-w-xl mx-auto">
            {progress !== null ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-[#363062] uppercase tracking-wider">
                  <span>Estimated Progress</span>
                  <span className="text-[#4D4C7D]">{progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#363062] via-[#4D4C7D] to-[#DFCFEE] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-[#4D4C7D] uppercase tracking-wider">No ETA provided for this maintenance window.</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Estimated Remaining</span>
                <span className="text-lg font-black text-[#363062] font-mono mt-0.5">
                  {remainingSeconds !== null ? formatTime(remainingSeconds) : "—"}
                </span>
              </div>
              <button
                onClick={fetchStatus}
                className="group bg-white hover:bg-[#DFCFEE]/20 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center transition-all duration-150"
              >
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw size={10} className="group-hover:rotate-180 transition-transform duration-300" /> Ping Interface
                </span>
                <span className="text-xs font-black text-[#4D4C7D] mt-1">Refresh Status</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
            {subsystems.map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between bg-white shadow-xs ${
                    sub.ok ? "text-emerald-700 bg-emerald-50 border-emerald-200/50" : "text-rose-700 bg-rose-50 border-rose-200/50"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold block text-slate-400 uppercase tracking-wide truncate">{sub.label}</span>
                    <span className="text-xs font-black mt-0.5 block">{sub.state}</span>
                  </div>
                  <Icon size={16} className="shrink-0 opacity-80" />
                </div>
              );
            })}
          </div>

          <div className="max-w-xl mx-auto pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleReturnHome}
                className="flex items-center justify-center gap-2 bg-[#363062] hover:bg-[#4D4C7D] text-white px-5 py-3 rounded-xl font-bold text-xs transition shadow-sm"
              >
                <Home size={14} /> Try Dashboard Anyway
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 px-5 py-3 rounded-xl font-bold text-xs transition"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default MaintenancePage;