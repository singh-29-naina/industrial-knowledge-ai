import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  BadgeCheck,
  ShieldCheck,
  FileText,
  Bot,
  Wrench,
  ChevronDown,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function useDesignFonts() {
  useEffect(() => {
    if (document.getElementById("ik-fonts")) return;
    const link = document.createElement("link");
    link.id = "ik-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
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

export default function Signup() {
  useDesignFonts();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Controls the new popup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignInClick = (e) => {
    if (e) e.preventDefault();
    setIsLeaving(true);
    window.setTimeout(() => navigate("/login"), 320);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.fullName,
      employeeId: formData.employeeId,
      email: formData.email,
      department: formData.department,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed framework error.");
      }

      // Instead of an inline message alert, trigger the popup modal!
      setShowSuccessPopup(true);

    } catch (err) {
      setError(err.message || "Network dynamic failure.");
    } finally {
      setLoading(false);
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
        .ik-scanline { animation: ik-scan 7s linear infinite; }
        .ik-rise { animation: ik-fade-up .6s cubic-bezier(.22,1,.36,1) both; }
        .ik-fade { animation: ik-fade-in .5s ease both; }
        .ik-btn-gradient {
          background: linear-gradient(120deg, #4A154B, #FF4081, #F50057, #4A154B);
          background-size: 300% 300%;
          animation: ik-drift 6s ease infinite;
        }
        .ik-live-dot { animation: ik-pulse-ring 2.2s ease-out infinite; }
        @keyframes ik-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(255, 64, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 64, 129, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ik-scanline, .ik-rise, .ik-fade, .ik-btn-gradient, .ik-live-dot {
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
        className={`w-full max-w-7xl bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(45,17,44,0.4)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 grid-flow-row ring-1 ring-white/20 transition-all duration-700 ease-out ${
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
              className="hidden xl:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/90 text-[10px] font-bold tracking-wider"
              style={{ fontFamily: FONT_MONO }}
            >
              <span className="relative flex h-2 w-2">
                <span className="ik-live-dot absolute inline-flex h-full w-full rounded-full bg-[#FF4081]" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4081]" />
              </span>
              LIVE CLUSTER
            </div>
          </div>

          <div className="relative ik-rise" style={{ animationDelay: "140ms" }}>
            <p className="uppercase tracking-[0.3em] text-[11px] font-black text-[#F8BBD0]" style={{ fontFamily: FONT_MONO }}>
              Welcome to
            </p>
            <h1 className="text-5xl font-black leading-[1.1] mt-4 text-white tracking-tighter" style={{ fontFamily: FONT_DISPLAY }}>
              Smart Industrial Hub
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/70 max-w-sm font-medium">
              Initialize your identity to access localized asset documentation and historical diagnostic arrays.
            </p>
          </div>

          <div className="relative flex flex-col divide-y divide-white/5 border-t border-white/10">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex gap-5 py-5 ik-rise"
                style={{ animationDelay: `${220 + i * 90}ms` }}
              >
                <div className="shrink-0 h-10 w-10 rounded-xl bg-[#FF4081]/10 border border-[#FF4081]/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-rotate-3 text-[#FF4081]">
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

        {/* RIGHT SECTION: REGISTRATION INTERFACE */}
        <div className="p-12 lg:p-16 flex items-center bg-white">
          <div
            className={`max-w-md mx-auto w-full transition-all duration-300 ease-in-out ${
              isLeaving ? "opacity-0 scale-95 -translate-y-4" : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <p className="uppercase tracking-[0.2em] text-[11px] font-black text-[#FF4081] ik-rise" style={{ fontFamily: FONT_MONO }}>
              Enterprise Registration
            </p>
            <h2 className="text-4xl font-black text-[#4A154B] mt-2 tracking-tighter ik-rise" style={{ fontFamily: FONT_DISPLAY, animationDelay: "60ms" }}>
              Create Account
            </h2>
            <p className="text-slate-500 mt-3 text-sm font-medium ik-rise" style={{ animationDelay: "100ms" }}>
              Register to access your company's Industrial Knowledge Platform.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-5 ik-rise" style={{ animationDelay: "140ms" }} onSubmit={handleCreateAccount}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-3.5 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                  <User className="w-5 h-5 text-[#FF4081]" />
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Enter your full name" required className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400" disabled={loading} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Employee ID</label>
                <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-3.5 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                  <BadgeCheck className="w-5 h-5 text-[#FF4081]" />
                  <input name="employeeId" value={formData.employeeId} onChange={handleInputChange} type="text" placeholder="EMP1023" required className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400" style={{ fontFamily: FONT_MONO }} disabled={loading} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Company Email</label>
                <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-3.5 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                  <Mail className="w-5 h-5 text-[#FF4081]" />
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@company.com" required className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400" disabled={loading} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Department</label>
                <div className="relative flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-3.5 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                  <Building2 className="w-5 h-5 text-[#FF4081] shrink-0" />
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required 
                    className="w-full ml-4 outline-none bg-transparent appearance-none text-sm font-semibold text-[#4A154B] placeholder-slate-400 cursor-pointer pr-8 z-10 raw-select"
                    disabled={loading}
                  >
                    <option value="" disabled hidden>Select Department</option>
                    <option value="Engineering" className="bg-white text-[#4A154B] font-medium">Engineering</option>
                    <option value="Production" className="bg-white text-[#4A154B] font-medium">Production</option>
                    <option value="Maintenance" className="bg-white text-[#4A154B] font-medium">Maintenance</option>
                    <option value="Operations" className="bg-white text-[#4A154B] font-medium">Operations</option>
                    <option value="Quality" className="bg-white text-[#4A154B] font-medium">Quality</option>
                    <option value="Safety" className="bg-white text-[#4A154B] font-medium">Safety</option>
                    <option value="HR" className="bg-white text-[#4A154B] font-medium">HR</option>
                    <option value="IT" className="bg-white text-[#4A154B] font-medium">IT</option>
                  </select>
                  <div className="absolute right-5 pointer-events-none flex items-center justify-center text-slate-400 focus-within:text-[#4A154B]">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Password</label>
                <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-3.5 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                  <Lock className="w-5 h-5 text-[#FF4081]" />
                  <input name="password" value={formData.password} onChange={handleInputChange} type={showPassword ? "text" : "password"} placeholder="Enter password" required className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-[#4A154B] transition-colors" disabled={loading}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#4A154B] uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-2xl px-5 py-3.5 transition-all focus-within:border-[#FF4081] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#F8BBD0]/40">
                  <ShieldCheck className="w-5 h-5 text-[#FF4081]" />
                  <input name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type={showConfirm ? "text" : "password"} placeholder="Confirm password" required className="w-full ml-4 outline-none bg-transparent text-sm font-semibold text-[#4A154B] placeholder-slate-400" disabled={loading} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-[#4A154B] transition-colors" disabled={loading}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 px-1">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 accent-[#4A154B]" disabled={loading} />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  I agree to the{" "}
                  <span className="text-[#FF4081] font-bold cursor-pointer hover:underline">Terms &amp; Conditions</span>{" "}
                  and <span className="text-[#FF4081] font-bold cursor-pointer hover:underline">Privacy Policy</span>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ik-btn-gradient w-full text-white font-black py-4.5 rounded-2xl shadow-xl shadow-[#FF4081]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wide disabled:opacity-50"
              >
                {loading ? "Processing..." : <>Create Account <Sparkles size={16} /></>}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase" style={{ fontFamily: FONT_MONO }}>
                Enterprise Access
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link to="/login" onClick={handleSignInClick} className="text-[#4A154B] font-black hover:text-[#FF4081] underline decoration-[#F8BBD0] decoration-4 underline-offset-4 transition-colors">
                Sign In
              </Link>
            </p>

            <div className="mt-10 rounded-2xl p-5 border border-[#F8BBD0]/40 bg-[#F8BBD0]/10">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-[#4A154B] mt-0.5 shrink-0" size={20} />
                <div>
                  <h3 className="font-bold text-sm text-[#4A154B]">Secure Enterprise Registration</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                    Your account will remain <strong>Pending Approval</strong> until verified by your company's administrator. Only approved employees can access the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* NEW PENDING APPROVAL CONFIRMATION POPUP MODAL */}
      {/* ========================================== */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md ik-fade">
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(45,17,44,0.3)] p-8 border border-slate-100 text-center relative overflow-hidden transition-all duration-500 scale-100"
            style={{ animation: "ik-fade-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
          >
            {/* Top decorative element */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#4A154B] via-[#FF4081] to-[#F50057]" />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#F8BBD0]/30 border border-[#FF4081]/20 flex items-center justify-center text-[#FF4081] mb-6">
              <Clock size={32} className="animate-pulse" />
            </div>

            <h3 className="text-2xl font-black text-[#4A154B] tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
              Application Submitted
            </h3>
            
            <p className="text-slate-600 text-sm mt-3 leading-relaxed font-medium">
              Your registration request is successfully logged in the system queue and is currently <strong>Pending Admin Approval</strong>.
            </p>

            <div className="my-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-left text-xs text-slate-500 space-y-2">
              <p>• <strong>User Reference:</strong> {formData.fullName}</p>
              <p>• <strong>ID Key:</strong> {formData.employeeId}</p>
              <p>• An automated configuration email will be transmitted to <strong>{formData.email}</strong> instantly upon verification approval.</p>
            </div>

            <button
              onClick={handleSignInClick}
              className="ik-btn-gradient w-full text-white font-black py-4 rounded-xl shadow-lg shadow-[#FF4081]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              Go to Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}