import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
  Bot,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Home,
  LogOut,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import your Auth hook

function useDesignFonts() {
  useEffect(() => {
    if (document.getElementById("ik-fonts")) return;
    const link = document.createElement("link");
    link.id = "ik-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght=500;600;700&family=Inter:wght=400;500;600&family=IBM+Plex+Mono:wght=400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const FONT_DISPLAY = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

const BG_PHOTO =
  "https://images.unsplash.com/photo-1678984240126-70bcddd7a228?auto=format&fit=crop&w=1800&q=80";

const FEATURES = [
  {
    icon: FileText,
    title: "Structural Ingestion",
    desc: "Tokenized manuals and SOPs, indexed for real-time neural search.",
  },
  {
    icon: Bot,
    title: "Industrial Copilot",
    desc: "Query active plant parameters using natural language processing.",
  },
  {
    icon: Wrench,
    title: "Predictive Analytics",
    desc: "Asset maintenance recommendations based on historical telemetry.",
  },
];

export default function Login() {
  useDesignFonts();
  const navigate = useNavigate();
  const { login } = useAuth(); // Context integration

  const [showPassword, setShowPassword] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Login Authentication States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password Workspace States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // Toggle this to true to test the themed maintenance view
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false); 
  const [progress, setProgress] = useState(74);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleCreateAccountClick = (e) => {
    e.preventDefault();
    setIsLeaving(true);
    window.setTimeout(() => navigate("/signup"), 320);
  };

  // --- 🟢 FIX 1: Corrected Login Submission Endpoint & Syncing Storage ---
  // --- 🟢 FIX: Bulletproof Login Submission with Safe Animation Triggers ---
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); 
  setVerifying(true);

  try {
    const response = await fetch('http://localhost:5000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log("Raw Backend JSON Response Object:", data);

    if (response.ok) {
      // Clear out corrupt memory layouts
      localStorage.clear();

      // Extract details safely
      const token = data.accessToken || data.token || "";
      const role = data.user?.role || data.role || "Technician";
      const name = data.user?.name || "User";

      // Instantly lock values into disk storage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);

      // Save to your globally shared React Context state
      login({
        token,
        role,
        email: data.user?.email || email,
        name: data.user?.name || "User"
      });

      // 💡 FIX THE CRASH: Trigger the state animation block, but clear the verifying state
      setVerifying(false);
      setVerified(true);
      
      // Give the success checkmark animation exactly 1 second to play, then route
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
      
    } else {
      // Catch bad passwords or 401 statuses gracefully without changing views
      setVerifying(false);
      setError(data.message || "Invalid authentication response credentials.");
    }
  } catch (err) {
    console.error("Network communication breakdown inside Login component handler:", err);
    setVerifying(false);
    setError("Failed to establish server connection.");
  }
};
  // --- 🟢 FIX 2: Corrected Reset Password Dispatch handler ---
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setSendingReset(true);
    setResetError("");
    setResetSent(false);

    try {
      // Using global API config settings pointing towards backend engine
      const response = await fetch('http://localhost:5000/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSent(true);
      } else {
        setResetError(data.message || "Failed to dispatch recovery link.");
      }
    } catch (err) {
      console.error("Error running password reset:", err);
      setResetError("Failed to establish connection to authorization network node.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-rose-50/20"
      style={{ fontFamily: FONT_BODY }}
    >
      <style>{`
        @keyframes ik-scan {
          0%   { transform: translateY(0%);   opacity: 0; }
          10%  { opacity: .65; }
          90%  { opacity: .65; }
          100% { transform: translateY(2400%); opacity: 0; }
        }
        @keyframes ik-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ik-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ik-drift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ik-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(255, 64, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0); }
        }
        @keyframes ik-spin {
          to { transform: rotate(360deg); }
        }
        .ik-scanline { animation: ik-scan 7s linear infinite; }
        .ik-rise { animation: ik-fade-up .6s cubic-bezier(.22,1,.36,1) both; }
        .ik-fade { animation: ik-fade-in .5s ease both; }
        .ik-btn-gradient {
          background: linear-gradient(120deg, #4A154B, #FF4081, #F50057, #4A154B);
          background-size: 300% 300%;
          animation: ik-drift 6s ease infinite;
        }
        .ik-live-dot { animation: ik-pulse-ring 2.2s ease-out infinite; }
        .ik-spinner { animation: ik-spin .8s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ik-scanline, .ik-rise, .ik-fade, .ik-btn-gradient, .ik-live-dot, .ik-spinner {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(160deg, #2D112C 0%, #4A154B 50%, #1A051B 100%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,187,208,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(248,187,208,.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className={`w-full max-w-6xl bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(45,17,44,0.4)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 ring-1 ring-white/20 transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[.98]"
        }`}
      >
        {/* LEFT SECTION: BRANDING & TELEMETRY */}
        <div
          className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
          style={{
            background: "linear-gradient(165deg, #2D112C 0%, #4A154B 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{
              backgroundImage: `url('${BG_PHOTO}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-[#FF4081]/60 shadow-[0_0_20px_2px_rgba(255,64,129,0.6)] ik-scanline pointer-events-none" />
          
          <div className="relative flex items-center justify-between ik-rise" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg text-[#F8BBD0] shadow-inner"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                IK
              </div>
              <div>
                <h2 className="font-bold text-xl text-white tracking-tight leading-tight" style={{ fontFamily: FONT_DISPLAY }}>
                  Industrial Knowledge
                </h2>
                <p className="text-[#F8BBD0]/50 text-[10px] font-bold tracking-[0.2em]" style={{ fontFamily: FONT_MONO }}>
                  INTELLIGENCE PLATFORM
                </p>
              </div>
            </div>

            <div
              className={`hidden xl:flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-white/90 text-[10px] font-bold tracking-wider ${
                isUnderMaintenance ? "bg-amber-500/20 text-amber-300 border-amber-500/20" : "bg-white/5"
              }`}
              style={{ fontFamily: FONT_MONO }}
            >
              <span className="relative flex h-2 w-2">
                <span className={`ik-live-dot absolute inline-flex h-full w-full rounded-full ${isUnderMaintenance ? "bg-amber-400" : "bg-[#FF4081]"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isUnderMaintenance ? "bg-amber-400" : "bg-[#FF4081]"}`} />
              </span>
              {isUnderMaintenance ? "OFFLINE" : "LIVE CLUSTER"}
            </div>
          </div>

          <div className="relative ik-rise" style={{ animationDelay: "140ms" }}>
            <p className={`uppercase tracking-[0.3em] text-[11px] font-black ${isUnderMaintenance ? "text-amber-400" : "text-[#F8BBD0]"}`} style={{ fontFamily: FONT_MONO }}>
              {isUnderMaintenance ? "Infrastructure Lockout" : "Welcome back to"}
            </p>
            <h1 className="text-5xl font-black leading-[1.1] mt-4 text-white tracking-tighter" style={{ fontFamily: FONT_DISPLAY }}>
              {isUnderMaintenance ? "Node Sync in Progress" : "Smart Industrial Hub"}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/70 max-w-sm font-medium">
              {isUnderMaintenance 
                ? "The analytical engine is currently re-indexing data clusters. Operational endpoints are temporarily suspended for structural integrity."
                : "Initialize your identity to access localized asset documentation and historical diagnostic arrays."
              }
            </p>
          </div>

          <div className="relative flex flex-col divide-y divide-white/5 border-t border-white/10">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex gap-5 py-5 ik-rise"
                style={{ animationDelay: `${220 + i * 90}ms` }}
              >
                <div className={`shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-rotate-3 ${
                  isUnderMaintenance ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-[#FF4081]/10 border-[#FF4081]/20 text-[#FF4081]"
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white" style={{ fontFamily: FONT_DISPLAY }}>
                    {title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="relative text-[10px] text-white/30 font-bold tracking-[0.2em] pt-4 ik-rise uppercase"
            style={{ fontFamily: FONT_MONO, animationDelay: "520ms" }}
          >
            12,458 Docs Indexed · 34 Nodes Online
          </div>
        </div>

        {/* RIGHT SECTION: DYNAMIC INTERFACE */}
        <div className="p-12 lg:p-20 flex items-center bg-white">
          <div
            className={`max-w-md mx-auto w-full transition-all duration-300 ease-in-out ${
              isLeaving ? "opacity-0 scale-95 -translate-y-4" : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            {isUnderMaintenance ? (
              /* MAINTENANCE INTERFACE */
              <div className="space-y-8 ik-fade">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-widest ring-1 ring-amber-500/10">
                    <AlertTriangle size={12} /> System Status: 503
                  </span>
                  <h2 className="text-4xl font-black text-[#4A154B] tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
                    Optimization Active
                  </h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    We are currently recalibrating the neural knowledge base. Please utilize the exit routes if immediate asset data is required.
                  </p>
                </div>

                <div className="bg-slate-50 border border-[#4A154B]/10 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-[#4A154B] uppercase tracking-widest">
                      <span>Syncing Data Schemas</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#4A154B] to-[#FF4081] rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => window.location.reload()}
                    className="group w-full bg-white border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-[#FF4081]/30 transition-all"
                  >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500 text-[#FF4081]" />
                    Retry Handshake
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <button className="ik-btn-gradient w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all hover:shadow-[#FF4081]/20">
                    <Home size={18} /> Corporate Portal
                  </button>
                  <button className="w-full bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm">
                    <LogOut size={18} /> Terminate Session
                  </button>
                </div>
              </div>
            ) : isForgotMode ? (
              /* FORGOT PASSWORD INTERFACE */
              <div className="space-y-6 ik-fade">
                <button 
                  onClick={() => { setIsForgotMode(false); setResetSent(false); setResetError(""); }}
                  className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#4A154B] transition-colors"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Authorization
                </button>

                <div className="space-y-2">
                  <p className="uppercase tracking-[0.2em] text-[11px] font-black text-[#FF4081]" style={{ fontFamily: FONT_MONO }}>
                    Node Access Recovery
                  </p>
                  <h2 className="text-4xl font-black text-[#4A154B] tracking-tighter" style={{ fontFamily: FONT_DISPLAY }}>
                    Reset Passcode
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    Provide your credential registry email below to receive a secure password recovery payload.
                  </p>
                </div>

                {resetError && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold leading-relaxed">
                    <AlertTriangle size={18} className="shrink-0 text-rose-500" />
                    {resetError}
                  </div>
                )}

                {resetSent ? (
                  <div className="space-y-4 py-4 ik-fade">
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                      <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">Recovery Link Sent</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">
                          We have transmitted a cryptographic reset link to your email registry. Please check your inbox.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Registry Email</label>
                      <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-4 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                        <Mail className="w-5 h-5 text-[#FF4081]" />
                        <input
                          type="email"
                          placeholder="name@company.com"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingReset}
                      className="ik-btn-gradient w-full text-white font-black py-4.5 rounded-2xl shadow-xl shadow-[#FF4081]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 text-sm tracking-wide"
                    >
                      {sendingReset ? (
                        <>
                          <span className="ik-spinner h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                          Transmitting recovery link...
                        </>
                      ) : (
                        <>Dispatch Token Link <Sparkles size={16} /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : !verified ? (
              /* LOGIN INTERFACE */
              <>
                <p className="uppercase tracking-[0.2em] text-[11px] font-black text-[#FF4081] ik-rise" style={{ fontFamily: FONT_MONO }}>
                  Identity Management
                </p>
                <h2 className="text-4xl font-black text-[#4A154B] mt-2 tracking-tighter ik-rise" style={{ fontFamily: FONT_DISPLAY, animationDelay: "60ms" }}>
                  Initialize Session
                </h2>
                <p className="text-slate-500 mt-3 text-sm font-medium ik-rise" style={{ animationDelay: "100ms" }}>
                  Provide enterprise credentials to access the hub.
                </p>

                {error && (
                  <div className="flex items-center gap-3 p-4 mt-6 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold leading-relaxed ik-rise" style={{ animationDelay: "120ms" }}>
                    <AlertTriangle size={18} className="shrink-0 text-rose-500" />
                    {error}
                  </div>
                )}

                <form className="mt-8 space-y-6 ik-rise" style={{ animationDelay: "140ms" }} onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Email Address</label>
                    <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-4 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                      <Mail className="w-5 h-5 text-[#FF4081]" />
                      <input
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Password</label>
                    <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-4 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                      <Lock className="w-5 h-5 text-[#FF4081]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-[#4A154B] transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#4A154B]" />
                      Maintain Session
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotMode(true)}
                      className="text-xs font-bold text-[#FF4081] hover:text-[#4A154B] transition-colors"
                    >
                      Reset Credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={verifying}
                    className="ik-btn-gradient w-full text-white font-black py-4.5 rounded-2xl shadow-xl shadow-[#FF4081]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 text-sm tracking-wide"
                  >
                    {verifying ? (
                      <>
                        <span className="ik-spinner h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                        Verifying Node Access...
                      </>
                    ) : (
                      <>Sign In <Sparkles size={16} /></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-10">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase" style={{ fontFamily: FONT_MONO }}>
                    Auth Gateway
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <p className="text-center text-sm font-medium text-slate-500">
                  New operator?{" "}
                  <Link
                    to="/signup"
                    onClick={handleCreateAccountClick}
                    className="text-[#4A154B] font-black hover:text-[#FF4081] underline decoration-[#F8BBD0] decoration-4 underline-offset-4 transition-colors"
                  >
                    Create Access Account
                  </Link>
                </p>

                <div className="mt-10 rounded-2xl p-5 border border-[#F8BBD0]/40 bg-[#F8BBD0]/10">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="text-[#4A154B] mt-0.5 shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-sm text-[#4A154B]">Encrypted Enterprise Tunnel</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                        Identity verification is required for all organizational clusters. Unauthorized attempts are logged at the node level.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* SUCCESS TRANSITION Animation layout view */
              <div className="py-20 flex flex-col items-center text-center ik-fade">
                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-[#4A154B] tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
                  Access Authorized
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-3">
                  Initializing workspace environment nodes...
                </p>
                <div className="mt-8 flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4A154B] animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4A154B] animate-bounce [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4A154B] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}