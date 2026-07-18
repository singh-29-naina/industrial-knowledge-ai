import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios.js";
import {
  Users, UserCheck, UserCog, ShieldCheck, Search, Plus, Check, X,
  Eye, ShieldAlert, Trash2, Activity, Briefcase,
  CalendarDays, Mail, SlidersHorizontal, Sparkles, Loader2, Clock, Copy, CheckCircle2
} from "lucide-react";

const ROLE_STYLES = {
  Admin: { chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10", avatar: "from-rose-600 to-red-400" },
  Manager: { chip: "bg-slate-50 text-slate-700 ring-1 ring-slate-600/10", avatar: "from-[#363062] to-[#4D4C7D]" },
  Engineer: { chip: "bg-slate-50 text-slate-700 ring-1 ring-slate-600/10", avatar: "from-[#4D4C7D] to-slate-400" },
  Technician: { chip: "bg-slate-50 text-slate-700 ring-1 ring-slate-600/10", avatar: "from-[#4D4C7D] to-slate-400" },
  Compliance_Officer: { chip: "bg-slate-50 text-slate-700 ring-1 ring-slate-600/10", avatar: "from-[#4D4C7D] to-slate-400" },
};

const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  Inactive: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  Suspended: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
};

const ASSIGNABLE_ROLES = ["Technician", "Engineer", "Manager", "Compliance_Officer", "Admin"];
const DEPARTMENTS = ["Engineering", "Production", "Maintenance", "Operations", "Quality", "Safety", "HR", "IT"];
const FILTERS = ["All", "Employees", "Managers", "Admins", "Pending"];
const STATUS_CYCLE = { Active: "Suspended", Suspended: "Inactive", Inactive: "Active" };

const initials = (name = "") => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const ACTIVITY_ICON = { upload: Briefcase, document: Briefcase, user: Users, compliance: ShieldCheck, system: SlidersHorizontal, alert: ShieldAlert };

const UserManagement = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [pending, setPending] = useState([]);
  const [pendingRoles, setPendingRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  // Modal states
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [roleDraft, setRoleDraft] = useState("");
  const [activityUser, setActivityUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", employeeId: "", email: "", department: "", role: "Technician" });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [copied, setCopied] = useState(false);

  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Admin" || userRole === "admin";

  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true });
  }, [isAdmin, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, pendingRes] = await Promise.all([api.get("/users"), api.get("/users/pending")]);
      setEmployees(usersRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load directory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin, loadData]);

  const counts = useMemo(() => {
    const managers = employees.filter((e) => e.role === "Manager").length;
    const admins = employees.filter((e) => e.role === "Admin").length;
    const staff = employees.length - managers - admins;
    return { total: employees.length, managers, admins, staff, pending: pending.length };
  }, [employees, pending]);

  const stats = [
    { title: "Total Users", value: counts.total, icon: Users, bg: "bg-slate-100 text-[#363062]" },
    { title: "Pending Requests", value: counts.pending, icon: UserCheck, bg: "bg-amber-50 text-amber-600" },
    { title: "Managers", value: counts.managers, icon: UserCog, bg: "bg-slate-100 text-[#4D4C7D]" },
    { title: "Admins", value: counts.admins, icon: ShieldCheck, bg: "bg-rose-50 text-rose-600" },
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter((u) => {
      const matchesQuery = !query || [u.name, u.email, u.department].some((f) => f?.toLowerCase().includes(query.toLowerCase()));
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Employees" && !["Manager", "Admin"].includes(u.role)) ||
        (activeFilter === "Managers" && u.role === "Manager") ||
        (activeFilter === "Admins" && u.role === "Admin");
      return matchesQuery && matchesFilter;
    });
  }, [employees, query, activeFilter]);

  const showPending = activeFilter === "All" || activeFilter === "Pending";
  const filteredPending = pending.filter((u) => !query || [u.name, u.email, u.department].some((f) => f?.toLowerCase().includes(query.toLowerCase())));

  const approve = async (p) => {
    const role = pendingRoles[p._id] || "Technician";
    setActionId(p._id);
    try {
      await api.post(`/users/approve/${p._id}`, { role });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Approval failed.");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (p) => {
    setActionId(p._id);
    try {
      await api.post(`/users/reject/${p._id}`);
      setPending((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      setError(err?.response?.data?.message || "Rejection failed.");
    } finally {
      setActionId(null);
    }
  };

  const cycleStatus = async (user) => {
    const nextStatus = STATUS_CYCLE[user.status] || "Active";
    setActionId(user._id);
    try {
      await api.patch(`/users/${user._id}/status`, { status: nextStatus });
      setEmployees((prev) => prev.map((e) => (e._id === user._id ? { ...e, status: nextStatus, isActive: nextStatus === "Active" } : e)));
    } catch (err) {
      setError(err?.response?.data?.message || "Status update failed.");
    } finally {
      setActionId(null);
    }
  };

  const removeEmployee = async (id) => {
    if (!confirm("Deprovision this user? This cannot be undone.")) return;
    setActionId(id);
    try {
      await api.delete(`/users/${id}`);
      setEmployees((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Deletion failed.");
    } finally {
      setActionId(null);
    }
  };

  // --- Profile popup ---
  const openProfile = async (user) => {
    setProfileUser(user);
    setProfileLoading(true);
    try {
      const res = await api.get(`/users/${user._id}`);
      setProfileUser(res.data);
    } catch (err) {
      console.error("Failed to load full profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Role change popup ---
  const openRoleModal = (user) => {
    setRoleModalUser(user);
    setRoleDraft(user.role);
  };

  const submitRoleChange = async () => {
    if (!roleModalUser) return;
    setActionId(roleModalUser._id);
    try {
      await api.patch(`/users/${roleModalUser._id}/role`, { role: roleDraft });
      setEmployees((prev) => prev.map((e) => (e._id === roleModalUser._id ? { ...e, role: roleDraft } : e)));
      setRoleModalUser(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Role update failed.");
    } finally {
      setActionId(null);
    }
  };

  // --- Activity popup ---
  const openActivity = async (user) => {
    setActivityUser(user);
    setActivityLoading(true);
    try {
      const res = await api.get(`/users/${user._id}/activity`);
      setActivityLogs(res.data);
    } catch (err) {
      console.error("Failed to load activity:", err);
      setActivityLogs([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // --- Add employee ---
  const submitNewUser = async () => {
    if (!newUser.name || !newUser.employeeId || !newUser.email || !newUser.department) {
      setAddError("All fields except role are required.");
      return;
    }
    setAddSubmitting(true);
    setAddError("");
    try {
      const res = await api.post("/users", newUser);
      setCreatedCredentials({ email: newUser.email, tempPassword: res.data.tempPassword });
      await loadData();
    } catch (err) {
      setAddError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewUser({ name: "", employeeId: "", email: "", department: "", role: "Technician" });
    setCreatedCredentials(null);
    setAddError("");
    setCopied(false);
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAdmin) return null;

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
                <h1 className="text-3xl font-black tracking-tight">User Management</h1>
                <p className="text-sm font-medium text-[#DFCFEE]/80 mt-1 max-w-xl">
                  Provision corporate credentials, modify system clearance arrays, and audit incoming personnel directories.
                </p>
              </div>
            </div>
            <button onClick={() => setShowAddModal(true)} className="group bg-white hover:bg-[#DFCFEE] text-[#363062] px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md font-bold text-sm shrink-0">
              <Plus size={16} className="transition-transform group-hover:rotate-90 duration-200" />
              Add Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700"><X size={16} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white rounded-2xl p-5 border border-[#363062]/10 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#4D4C7D] uppercase tracking-wider">{item.title}</p>
                  <h2 className="text-2xl font-black text-[#363062]">{item.value}</h2>
                </div>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${item.bg}`}><Icon size={18} /></div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white border border-[#363062]/10 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center bg-slate-50 border border-[#363062]/10 rounded-xl px-4 flex-1 focus-within:border-[#4D4C7D] transition-colors">
            <Search size={16} className="text-[#4D4C7D]/60 shrink-0" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter active structural nodes, identity tags, email directories..." className="w-full bg-transparent outline-none px-3 py-2.5 text-xs text-[#363062] placeholder-[#4D4C7D]/50 font-semibold" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl scrollbar-none">
            {FILTERS.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-lg transition-all text-xs font-bold whitespace-nowrap ${activeFilter === filter ? "bg-[#363062] text-white shadow-sm" : "text-[#4D4C7D] hover:text-[#363062]"}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#4D4C7D]">
            <Loader2 size={22} className="animate-spin mr-2" /> Loading directory...
          </div>
        ) : (
          <>
            {showPending && filteredPending.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-md font-bold text-[#363062] tracking-tight">Awaiting Structural Clearance</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">{filteredPending.length} Verification Pending</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPending.map((user) => (
                    <div key={user._id} className="bg-white rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-5 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[#363062] to-[#4D4C7D] text-white flex items-center justify-center text-sm font-bold shadow-sm">{initials(user.name)}</div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-[#363062] truncate">{user.name}</h3>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {user.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] bg-slate-100 text-[#4D4C7D] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Briefcase size={10} /> {user.department}</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ring-1 ring-amber-500/10"><CalendarDays size={10} /> {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <select value={pendingRoles[user._id] || "Technician"} onChange={(e) => setPendingRoles((prev) => ({ ...prev, [user._id]: e.target.value }))} className="flex-1 bg-slate-50 border border-slate-200 text-[#363062] py-2 px-2 rounded-xl text-xs font-bold outline-none">
                          {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                        </select>
                        <button disabled={actionId === user._id} onClick={() => approve(user)} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 px-4 rounded-xl transition text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"><Check size={14} /> Accept</button>
                        <button disabled={actionId === user._id} onClick={() => reject(user)} className="bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 text-rose-600 p-2 rounded-xl transition flex items-center justify-center"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-md font-bold text-[#363062] tracking-tight">Active Identity Directory Matrix</h2>
                <span className="text-xs font-bold text-[#4D4C7D] bg-white px-3 py-1 rounded-lg border border-[#363062]/10">Matches Found: {filteredEmployees.length}</span>
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-[#363062]/20 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                  <SlidersHorizontal size={32} className="text-[#4D4C7D]/30 mb-3" />
                  <p className="text-xs font-semibold text-[#4D4C7D]">No identities match active structural tracking filters.</p>
                </div>
              ) : (
                <div className="bg-white p-0.5 rounded-3xl bg-gradient-to-br from-[#363062]/20 via-[#4D4C7D]/5 to-[#363062]/20 shadow-xl overflow-hidden">
                  <div className="bg-white rounded-[22px] overflow-hidden">
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-slate-50/70 border-b border-[#363062]/10 text-[10px] font-bold uppercase tracking-wider text-[#4D4C7D]">
                      <div className="col-span-4">Operational Identity</div>
                      <div className="col-span-2">Department Node</div>
                      <div className="col-span-2">Clearance Authorization</div>
                      <div className="col-span-2">System Status</div>
                      <div className="col-span-2 text-right">Action Framework Array</div>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                      {filteredEmployees.map((user) => {
                        const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.Technician;
                        const busy = actionId === user._id;
                        return (
                          <div key={user._id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-[#DFCFEE]/10 transition-colors duration-150 group">
                            <div className="col-span-1 lg:col-span-4 flex items-center gap-4 min-w-0">
                              <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${roleStyle.avatar} text-white flex items-center justify-center text-xs font-black shadow-sm`}>{initials(user.name)}</div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-[#363062] truncate group-hover:text-[#4D4C7D] transition-colors">{user.name}</h4>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                              </div>
                            </div>
                            <div className="col-span-1 lg:col-span-2 lg:block flex justify-between items-center border-t border-dashed border-slate-100 pt-3 lg:pt-0 lg:border-none">
                              <span className="text-[10px] font-bold text-[#4D4C7D] uppercase tracking-wider lg:hidden">Department</span>
                              <span className="text-xs text-[#363062] font-semibold bg-slate-100/80 px-2.5 py-1 rounded-md">{user.department}</span>
                            </div>
                            <div className="col-span-1 lg:col-span-2 lg:block flex justify-between items-center">
                              <span className="text-[10px] font-bold text-[#4D4C7D] uppercase tracking-wider lg:hidden">Clearance</span>
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${roleStyle.chip}`}>{user.role}</span>
                            </div>
                            <div className="col-span-1 lg:col-span-2 lg:block flex justify-between items-center">
                              <span className="text-[10px] font-bold text-[#4D4C7D] uppercase tracking-wider lg:hidden">Status Block</span>
                              <div className="flex flex-col lg:items-start items-end gap-1">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[user.status] ?? STATUS_STYLES.Inactive}`}>{user.status || (user.isActive ? "Active" : "Inactive")}</span>
                                <span className="text-[9px] text-slate-400 font-medium lg:block hidden">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="col-span-1 lg:col-span-2 flex items-center lg:justify-end justify-start gap-1.5 border-t border-slate-100 pt-3 lg:pt-0 lg:border-none mt-1 lg:mt-0">
                              <button onClick={() => openProfile(user)} className="h-8 w-8 bg-slate-50 border border-[#363062]/10 rounded-lg flex items-center justify-center text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/30 transition-colors" title="Inspect Profile Data"><Eye size={13} /></button>
                              <button onClick={() => openRoleModal(user)} className="h-8 w-8 bg-slate-50 border border-[#363062]/10 rounded-lg flex items-center justify-center text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/30 transition-colors" title="Modify Hierarchy Settings"><UserCog size={13} /></button>
                              <button disabled={busy} onClick={() => cycleStatus(user)} className="h-8 w-8 bg-slate-50 border border-[#363062]/10 rounded-lg flex items-center justify-center text-[#4D4C7D] hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 disabled:opacity-50 transition-colors" title="Cycle Status"><ShieldAlert size={13} /></button>
                              <button disabled={busy} onClick={() => removeEmployee(user._id)} className="h-8 w-8 bg-slate-50 border border-[#363062]/10 rounded-lg flex items-center justify-center text-[#4D4C7D] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 transition-colors" title="Deprovision Directory Object"><Trash2 size={13} /></button>
                              <button onClick={() => openActivity(user)} className="h-8 w-8 bg-slate-50 border border-[#363062]/10 rounded-lg flex items-center justify-center text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/30 transition-colors" title="Inquiry Metrics Analytics"><Activity size={13} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== Profile Popup ===== */}
        {profileUser && (
          <div className="fixed inset-0 bg-[#363062]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setProfileUser(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${(ROLE_STYLES[profileUser.role] ?? ROLE_STYLES.Technician).avatar} text-white flex items-center justify-center text-lg font-black shadow-sm`}>
                      {initials(profileUser.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#363062]">{profileUser.name}</h3>
                      <p className="text-xs text-slate-400">{profileUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setProfileUser(null)} className="text-[#4D4C7D] hover:text-[#363062]"><X size={18} /></button>
                </div>

                {profileLoading ? (
                  <div className="flex items-center justify-center py-8 text-[#4D4C7D] gap-2 text-xs"><Loader2 size={16} className="animate-spin" /> Loading full profile...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Employee ID</span><span className="font-bold text-[#363062]">{profileUser.employeeId || "—"}</span></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Department</span><span className="font-bold text-[#363062]">{profileUser.department}</span></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Role</span><span className="font-bold text-[#363062]">{profileUser.role}</span></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Status</span><span className="font-bold text-[#363062]">{profileUser.status}</span></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Joined</span><span className="font-bold text-[#363062]">{new Date(profileUser.createdAt).toLocaleDateString()}</span></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Last Login</span><span className="font-bold text-[#363062]">{profileUser.lastLogin ? new Date(profileUser.lastLogin).toLocaleDateString() : "Never"}</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Role Change Popup ===== */}
        {roleModalUser && (
          <div className="fixed inset-0 bg-[#363062]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setRoleModalUser(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#363062]">Modify Clearance Role</h3>
                  <button onClick={() => setRoleModalUser(null)} className="text-[#4D4C7D] hover:text-[#363062]"><X size={18} /></button>
                </div>
                <p className="text-xs text-slate-500">Change access level for <span className="font-bold text-[#363062]">{roleModalUser.name}</span></p>
                <select value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-[#363062] py-3 px-3 rounded-xl text-sm font-bold outline-none">
                  {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setRoleModalUser(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#4D4C7D] hover:bg-slate-50">Cancel</button>
                  <button disabled={actionId === roleModalUser._id || roleDraft === roleModalUser.role} onClick={submitRoleChange} className="px-5 py-2.5 rounded-xl bg-[#363062] text-white hover:bg-[#4D4C7D] text-xs font-bold disabled:opacity-50">
                    {actionId === roleModalUser._id ? "Saving..." : "Save Role"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Activity Popup ===== */}
        {activityUser && (
          <div className="fixed inset-0 bg-[#363062]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActivityUser(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-[#363062]">Activity Log</h3>
                  <p className="text-xs text-slate-400">{activityUser.name}</p>
                </div>
                <button onClick={() => setActivityUser(null)} className="text-[#4D4C7D] hover:text-[#363062]"><X size={18} /></button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2">
                {activityLoading ? (
                  <div className="flex items-center justify-center py-8 text-[#4D4C7D] gap-2 text-xs"><Loader2 size={16} className="animate-spin" /> Loading activity...</div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 flex flex-col items-center gap-2"><Clock size={20} className="text-slate-300" /> No recorded activity for this user.</div>
                ) : (
                  activityLogs.map((log, idx) => {
                    const Icon = ACTIVITY_ICON[log.type] || Clock;
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                        <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#363062] shrink-0"><Icon size={14} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#363062] truncate">{log.title}</p>
                          <p className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Add Employee Modal ===== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[#363062]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAddModal}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#363062]">Provision New Employee</h3>
                  <button onClick={closeAddModal} className="text-[#4D4C7D] hover:text-[#363062]"><X size={18} /></button>
                </div>

                {createdCredentials ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-bold">
                      <CheckCircle2 size={16} /> User created successfully.
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <p><span className="font-bold text-[#4D4C7D]">Email:</span> {createdCredentials.email}</p>
                      <p><span className="font-bold text-[#4D4C7D]">Temp Password:</span> <span className="font-mono">{createdCredentials.tempPassword}</span></p>
                      <p className="text-[10px] text-amber-600 pt-1">Share this password securely — it will not be shown again.</p>
                    </div>
                    <button onClick={copyCredentials} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#363062] py-2.5 rounded-xl text-xs font-bold transition">
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Credentials"}
                    </button>
                    <button onClick={closeAddModal} className="w-full bg-[#363062] hover:bg-[#4D4C7D] text-white py-3 rounded-xl text-xs font-bold transition">Done</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addError && <p className="text-xs font-semibold text-rose-500">{addError}</p>}
                    <input type="text" placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-[#363062] outline-none focus:border-[#4D4C7D]" />
                    <input type="text" placeholder="Employee ID" value={newUser.employeeId} onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-[#363062] outline-none focus:border-[#4D4C7D]" />
                    <input type="email" placeholder="Company Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-[#363062] outline-none focus:border-[#4D4C7D]" />
                    <select value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-[#363062] outline-none">
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-[#363062] outline-none">
                      {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                    <button disabled={addSubmitting} onClick={submitNewUser} className="w-full bg-[#363062] hover:bg-[#4D4C7D] disabled:opacity-60 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                      {addSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {addSubmitting ? "Provisioning..." : "Create User"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserManagement;