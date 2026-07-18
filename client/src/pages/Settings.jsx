import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";
import {
  Building2, Save, Mail, Phone, Globe, MapPin, Cpu, BellRing,
  ShieldCheck, HardDrive, Sparkles, LogOut, Loader2, CheckCircle2,
} from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#363062] transition shadow-inner"></div>
    <div className="absolute left-0.5 top-0.5 bg-white h-5 w-5 rounded-full transition peer-checked:translate-x-5 shadow-sm"></div>
  </label>
);

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [stackStatus, setStackStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const userRole = localStorage.getItem("userRole") || "";
  const isAdmin = userRole.toLowerCase() === "admin";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [settingsRes, stackRes] = await Promise.all([
          api.get("/api/settings"),
          api.get("/api/settings/stack-status"),
        ]);
        setSettings(settingsRes.data);
        setStackStatus(stackRes.data);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (section, key, value) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setError("");
    try {
      const res = await api.put("/api/settings", settings);
      setSettings(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      console.error("Logout request failed (clearing local session anyway):", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  if (loading || !settings) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center gap-2 text-[#4D4C7D]">
          <Loader2 size={20} className="animate-spin" /> Loading settings...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-8 font-sans antialiased text-slate-800">

        <div className="bg-gradient-to-br from-[#363062] via-[#4D4C7D] to-[#363062] rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/10">
                <Sparkles size={26} className="text-[#DFCFEE]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">System Settings</h1>
                <p className="text-sm font-medium text-[#DFCFEE]/80 mt-1 max-w-xl">
                  Configure corporate credentials, calibrate operational AI baseline telemetry arrays, and maintain security parameters.
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-white hover:bg-[#DFCFEE] text-[#363062] px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md font-bold text-sm shrink-0 disabled:opacity-70"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-rose-500 px-2">{error}</p>}
        {!isAdmin && (
          <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            You're viewing settings in read-only mode. Only Admins can save changes.
          </p>
        )}

        {/* Company Profile */}
        <div className="bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-lg overflow-hidden">
          <div className="bg-white rounded-[22px] p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-xl bg-[#DFCFEE]/30 flex items-center justify-center text-[#363062]"><Building2 size={22} /></div>
              <div>
                <h2 className="text-xl font-bold text-[#363062]">Company Profile</h2>
                <p className="text-xs font-semibold text-[#4D4C7D]/70">Update your core organizational infrastructure records.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { key: "name", label: "Company Name", icon: null, type: "text" },
                { key: "industry", label: "Industry Classification", icon: null, type: "text" },
                { key: "email", label: "Contact Email Address", icon: Mail, type: "email" },
                { key: "phone", label: "Operational Hotline", icon: Phone, type: "text" },
                { key: "website", label: "Corporate Domain Portal", icon: Globe, type: "text" },
                { key: "address", label: "Geographic HQ Node", icon: MapPin, type: "text" },
              ].map(({ key, label, icon: Icon, type }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-[#363062] tracking-wide uppercase flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-[#4D4C7D]" />} {label}
                  </label>
                  <input
                    type={type}
                    disabled={!isAdmin}
                    value={settings.company[key] || ""}
                    onChange={(e) => updateField("company", key, e.target.value)}
                    className="w-full mt-2 border border-[#363062]/10 bg-slate-50 rounded-xl px-4 py-3 outline-none text-xs font-semibold text-[#363062] focus:bg-white focus:border-[#4D4C7D] transition-all disabled:opacity-60"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Toggles */}
          <div className="bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-md">
            <div className="bg-white rounded-[22px] p-6 lg:p-8 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#DFCFEE]/30 flex items-center justify-center text-[#363062]"><Cpu size={18} /></div>
                <div>
                  <h3 className="text-md font-bold text-[#363062]">Copilot & Data Ingestion</h3>
                  <p className="text-[11px] font-semibold text-[#4D4C7D]/70">Calibrate localized AI processing matrices.</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { key: "copilotEnabled", title: "Enable AI Assistant Copilot", desc: "Allow localized context queries across shop floor frameworks." },
                  { key: "autoIndexOnUpload", title: "Auto Index Core Infrastructure Files", desc: "Instantly run real-time document tokenization matrices upon upload." },
                  { key: "ocrEnabled", title: "Automated OCR Content Extraction", desc: "Not yet implemented in the ingestion pipeline — toggle has no effect today." },
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="max-w-[75%]">
                      <h4 className="text-xs font-bold text-[#363062]">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={settings.aiToggles[item.key]}
                      onChange={(e) => isAdmin && updateField("aiToggles", item.key, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-md">
            <div className="bg-white rounded-[22px] p-6 lg:p-8 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#DFCFEE]/30 flex items-center justify-center text-[#363062]"><BellRing size={18} /></div>
                <div>
                  <h3 className="text-md font-bold text-[#363062]">Alert Channels Configuration</h3>
                  <p className="text-[11px] font-semibold text-[#4D4C7D]/70">Control message broadcast layers across the system.</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { key: "clearanceInquiries", title: "Critical Clearance Inquiries", desc: "Broadcast immediate admin updates for authorization queue updates." },
                  { key: "maintenanceAlerts", title: "Automated Predictive Maintenance Trigger", desc: "Deliver telemetry alerts when system assets breach baseline arrays." },
                  { key: "complianceShifts", title: "Regulatory Compliance Matrix Shifts", desc: "Notify node managers when certifications near expiration thresholds." },
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="max-w-[75%]">
                      <h4 className="text-xs font-bold text-[#363062]">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={settings.notificationToggles[item.key]}
                      onChange={(e) => isAdmin && updateField("notificationToggles", item.key, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Security */}
          <div className="lg:col-span-2 bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-md">
            <div className="bg-white rounded-[22px] p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#DFCFEE]/30 flex items-center justify-center text-[#363062]"><ShieldCheck size={18} /></div>
                <div>
                  <h3 className="text-md font-bold text-[#363062]">Security Configurations</h3>
                  <p className="text-[11px] font-semibold text-[#4D4C7D]/70">Enforce enterprise access clearance parameters.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-[#363062] uppercase tracking-wide">Automatic Session Timeout</label>
                  <select
                    disabled={!isAdmin}
                    value={settings.security.sessionTimeoutMinutes}
                    onChange={(e) => updateField("security", "sessionTimeoutMinutes", Number(e.target.value))}
                    className="w-full mt-2 border border-[#363062]/10 bg-slate-50 rounded-xl px-3 py-2.5 outline-none text-xs font-semibold text-[#363062] disabled:opacity-60"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1">Note: changing this doesn't yet update the backend token expiry — that's still fixed via `ACCESS_TOKEN_EXPIRE` in .env.</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#363062] uppercase tracking-wide">Min Password Length</label>
                  <select
                    disabled={!isAdmin}
                    value={settings.security.minPasswordLength}
                    onChange={(e) => updateField("security", "minPasswordLength", Number(e.target.value))}
                    className="w-full mt-2 border border-[#363062]/10 bg-slate-50 rounded-xl px-3 py-2.5 outline-none text-xs font-semibold text-[#363062] disabled:opacity-60"
                  >
                    <option value={8}>8 Characters</option>
                    <option value={10}>10 Characters</option>
                    <option value={12}>12 Characters</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs mt-4">
                <div>
                  <h4 className="font-bold text-[#363062]">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Not yet implemented — toggle is a placeholder for a future release.</p>
                </div>
                <Toggle
                  checked={settings.security.twoFactorEnabled}
                  onChange={(e) => isAdmin && updateField("security", "twoFactorEnabled", e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* Storage limits */}
          <div className="bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-md">
            <div className="bg-white rounded-[22px] p-6 lg:p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-[#DFCFEE]/30 flex items-center justify-center text-[#363062]"><HardDrive size={18} /></div>
                  <div>
                    <h3 className="text-md font-bold text-[#363062]">Data Matrix Caps</h3>
                    <p className="text-[11px] font-semibold text-[#4D4C7D]/70">Ingestion file volume handling.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#363062] uppercase tracking-wide">Max Upload Cap Size</label>
                    <select
                      disabled={!isAdmin}
                      value={settings.storage.maxUploadMB}
                      onChange={(e) => updateField("storage", "maxUploadMB", Number(e.target.value))}
                      className="w-full mt-2 border border-[#363062]/10 bg-slate-50 rounded-xl px-3 py-2.5 outline-none text-xs font-semibold text-[#363062] disabled:opacity-60"
                    >
                      <option value={25}>25 MB per object</option>
                      <option value={50}>50 MB per object</option>
                      <option value={100}>100 MB per object</option>
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1">Note: actual enforced limit is set server-side in `middleware/upload.js` and won't change until that's updated to match.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#363062] uppercase tracking-wide">Default Category</label>
                    <select
                      disabled={!isAdmin}
                      value={settings.storage.defaultCategory}
                      onChange={(e) => updateField("storage", "defaultCategory", e.target.value)}
                      className="w-full mt-2 border border-[#363062]/10 bg-slate-50 rounded-xl px-3 py-2.5 outline-none text-xs font-semibold text-[#363062] disabled:opacity-60"
                    >
                      <option>SOPs</option>
                      <option>Manuals</option>
                      <option>Maintenance Records</option>
                      <option>Safety & Regulations</option>
                      <option>Inspection Reports</option>
                      <option>Audit Artifacts</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2">
                <span className="text-[10px] font-bold text-[#363062] uppercase tracking-wide">Accepted File Types</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {settings.storage.acceptedFileTypes.map((ext) => (
                    <span key={ext} className="text-[9px] font-black bg-slate-100 text-[#4D4C7D] px-2 py-1 rounded-md border border-slate-200">{ext}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live stack readout — real values now */}
        <div className="bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-md">
          <div className="bg-white rounded-[22px] p-6 lg:p-8">
            <h3 className="text-sm font-bold text-[#363062] uppercase tracking-wider mb-6">Active LLM Stack Deployment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Core Processing Engine", val: stackStatus?.llmEngine },
                { label: "Vector Index Database", val: stackStatus?.vectorStore },
                { label: "OCR Processing Layer", val: stackStatus?.ocrLayer },
                { label: "Storage Footprint", val: stackStatus?.storageFootprint },
              ].map((c, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{c.label}</span>
                  <span className="text-xs font-black text-[#363062] mt-1 block truncate">{c.val || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session management — now actually functional */}
        <div className="bg-rose-50/40 p-0.5 rounded-3xl bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-rose-500/20 shadow-md">
          <div className="bg-white rounded-[22px] p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
              <div>
                <h2 className="text-lg font-bold text-rose-950">Identity Session Pipeline</h2>
                <p className="text-xs font-semibold text-rose-800/70 mt-0.5">
                  Terminates your active session and clears local authentication state.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
              >
                <LogOut size={14} /> Terminate Session
              </button>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default Settings;