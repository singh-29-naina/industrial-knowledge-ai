import {
  ArrowRight,
  Play,
  BrainCircuit,
  FileText,
  ShieldCheck,
  Menu,
  X,
  Upload,
  MessageSquareText,
  Sparkles,
  CheckCircle2,
  Bot,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function useDesignFonts() {
  useEffect(() => {
    if (document.getElementById("kf-fonts")) return;
    const link = document.createElement("link");
    link.id = "kf-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const FONT_DISPLAY = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

const FEATURES = [
  {
    icon: FileText,
    title: "Knowledge Hub",
    desc: "Upload SOPs, manuals, reports and policies in one secure place with smart categorization.",
    accent: "rose",
  },
  {
    icon: BrainCircuit,
    title: "AI Copilot",
    desc: "Ask natural language questions and receive instant answers pulled from your enterprise documents.",
    accent: "violet",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    desc: "Manage Admins, Managers and Employees with role-based clearance across the whole platform.",
    accent: "emerald",
  },
];

const ACCENT_STYLES = {
  rose: {
    icon: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
    tag: "text-rose-600",
  },
  violet: {
    icon: "bg-[#DFCFEE]/50 text-[#363062] border-[#363062]/10 group-hover:bg-[#363062] group-hover:text-white group-hover:border-[#363062]",
    tag: "text-[#363062]",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    tag: "text-emerald-600",
  },
};

const STEPS = [
  {
    icon: Upload,
    title: "Upload your documents",
    desc: "Drop in SOPs, manuals, policies and reports — KnowFlow AI organizes them automatically.",
  },
  {
    icon: MessageSquareText,
    title: "Ask anything",
    desc: "Type a question in plain language and get answers pulled straight from your own content.",
  },
  {
    icon: Sparkles,
    title: "Work smarter",
    desc: "Your team spends less time searching and more time acting on what they find.",
  },
];

const STATS = [
  { value: "10k+", label: "Documents indexed" },
  { value: "98%", label: "Answer accuracy" },
  { value: "3.5x", label: "Faster search" },
  { value: "24/7", label: "AI availability" },
];

const DEMO_QUESTION = "Why did Pump P101 fail last month?";
const DEMO_ANSWER =
  "Bearing thermal overload combined with a missed lubrication cycle in week 3. Recommended: swap the bearing assembly and add vibration monitoring.";
const DEMO_SOURCES = ["Pump_Manual.pdf", "Maintenance_Report.pdf"];

// Types out the hero demo question, then the answer, then pauses and loops.
function useTypingDemo() {
  const [qText, setQText] = useState("");
  const [aText, setAText] = useState("");
  const [phase, setPhase] = useState("q"); // q | a | sources | pause
  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduceMotion.current) {
      setQText(DEMO_QUESTION);
      setAText(DEMO_ANSWER);
      setPhase("sources");
      return;
    }

    let timeout;
    let i = 0;

    const typeQuestion = () => {
      if (i <= DEMO_QUESTION.length) {
        setQText(DEMO_QUESTION.slice(0, i));
        i += 1;
        timeout = setTimeout(typeQuestion, 38);
      } else {
        timeout = setTimeout(() => {
          setPhase("a");
          i = 0;
          typeAnswer();
        }, 500);
      }
    };

    const typeAnswer = () => {
      if (i <= DEMO_ANSWER.length) {
        setAText(DEMO_ANSWER.slice(0, i));
        i += 1;
        timeout = setTimeout(typeAnswer, 16);
      } else {
        timeout = setTimeout(() => setPhase("sources"), 400);
        timeout = setTimeout(() => {
          setPhase("pause");
        }, 3200);
        timeout = setTimeout(() => {
          setQText("");
          setAText("");
          setPhase("q");
          i = 0;
          typeQuestion();
        }, 4600);
      }
    };

    typeQuestion();
    return () => clearTimeout(timeout);
  }, []);

  return { qText, aText, phase };
}

const LandingPage = () => {
  useDesignFonts();
  const [open, setOpen] = useState(false);
  const { qText, aText, phase } = useTypingDemo();

  return (
    <div className="min-h-screen bg-[#FBFAFD] text-[#4B5563]" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @keyframes kf-blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes kf-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .kf-cursor { animation: kf-blink 1s step-end infinite; }
        .kf-rise { animation: kf-fade-up .6s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .kf-cursor, .kf-rise { animation: none !important; }
        }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-[#DFCFEE]/90 backdrop-blur-lg border-b border-[#363062]/10">
        <div className="max-w-7xl mx-auto h-16 sm:h-18 px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/image.png" alt="KnowFlow AI" className="h-9 sm:h-10" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="relative text-[#4D4C7D] hover:text-[#363062] font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-[#363062] after:transition-all after:duration-300 hover:after:w-full">
              Features
            </a>
            <a href="#how-it-works" className="relative text-[#4D4C7D] hover:text-[#363062] font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-[#363062] after:transition-all after:duration-300 hover:after:w-full">
              How it works
            </a>
            <a href="#about" className="relative text-[#4D4C7D] hover:text-[#363062] font-medium transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-[#363062] after:transition-all after:duration-300 hover:after:w-full">
              About
            </a>
            <Link to="/login" className="text-[#363062] font-semibold hover:text-[#4D4C7D] transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-[#363062] hover:bg-[#2F2B55] text-white px-5 py-2.5 rounded-xl border border-[#363062] transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-[#363062]/30">
              Get Started
            </Link>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden h-10 w-10 rounded-xl bg-white/70 border border-[#363062]/10 hover:bg-white hover:border-[#363062]/20 flex items-center justify-center text-[#363062] transition-all duration-200 hover:scale-105 active:scale-90"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`md:hidden overflow-hidden bg-[#DFCFEE] border-t border-[#363062]/10 transition-all duration-300 ${open ? "max-h-80" : "max-h-0"}`}>
          <div className="flex flex-col p-5 gap-1">
            <a href="#features" onClick={() => setOpen(false)} className="py-3 px-2 rounded-lg text-[#4D4C7D] font-medium hover:bg-white/60 hover:text-[#363062] transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="py-3 px-2 rounded-lg text-[#4D4C7D] font-medium hover:bg-white/60 hover:text-[#363062] transition-colors">How it works</a>
            <a href="#about" onClick={() => setOpen(false)} className="py-3 px-2 rounded-lg text-[#4D4C7D] font-medium hover:bg-white/60 hover:text-[#363062] transition-colors">About</a>
            <Link to="/login" className="py-3 px-2 rounded-lg text-[#363062] font-semibold hover:bg-white/60 transition-colors">Login</Link>
            <Link to="/signup" className="mt-2 bg-[#363062] border border-[#363062] text-white rounded-xl py-3 text-center font-medium hover:bg-[#2F2B55] transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[#827397]/20 blur-3xl" />
          <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-[#DFCFEE]/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            {/* Left */}
            <div className="text-center lg:text-left kf-rise">
              <span
                className="inline-flex items-center gap-2 bg-white border border-[#E6E1EE] rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4D4C7D] shadow-sm"
                style={{ fontFamily: FONT_MONO }}
              >
                <BrainCircuit size={14} className="text-[#363062]" />
                Enterprise Knowledge, Answered
              </span>

              <h1
                className="mt-7 text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] text-[#363062] tracking-tight"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Ask your documents
                <br />
                <span className="text-[#827397]">anything.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#4B5563] leading-7 sm:leading-8 max-w-xl mx-auto lg:mx-0">
                Upload SOPs, manuals, reports and policies. Search instantly, or just ask —
                KnowFlow AI reads your enterprise knowledge so your team doesn't have to.
              </p>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  to="/signup"
                  className="group bg-[#363062] hover:bg-[#2F2B55] text-white px-7 py-4 rounded-2xl border border-[#363062] flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#363062]/30 shadow-sm font-semibold"
                >
                  Get Started
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <button className="group bg-white border border-[#E6E1EE] hover:border-[#D5CFE3] hover:bg-[#ECE8F3] px-7 py-4 rounded-2xl flex items-center gap-2 transition-all duration-300 text-[#363062] hover:scale-105 font-semibold">
                  <Play size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-2 text-sm text-[#6B7280]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-[#363062]" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-[#363062]" /> Setup in minutes
                </span>
              </div>
            </div>

            {/* Right: live typing demo — signature element */}
            <div className="relative max-w-md mx-auto lg:max-w-none kf-rise" style={{ animationDelay: "120ms" }}>
              <div className="bg-white border border-[#E6E1EE] rounded-3xl shadow-lg p-5 sm:p-6">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#E6E1EE]">
                  <div className="h-8 w-8 rounded-xl bg-[#363062] text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <span className="text-xs font-bold text-[#363062] tracking-tight">Industrial AI Copilot</span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider" style={{ fontFamily: FONT_MONO }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
                  </span>
                </div>

                {/* question bubble */}
                <div className="flex justify-end mb-4">
                  <div className="bg-[#363062] text-white text-sm font-medium rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] min-h-[2.75rem]">
                    {qText}
                    {phase === "q" && <span className="kf-cursor">▍</span>}
                  </div>
                </div>

                {/* answer bubble */}
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#DFCFEE]/60 text-[#363062] flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-50 border border-[#363062]/5 text-[#363062] text-sm leading-relaxed rounded-2xl rounded-tl-sm px-4 py-3 min-h-[4.5rem]">
                    {aText}
                    {phase === "a" && <span className="kf-cursor">▍</span>}
                    {(phase === "sources" || phase === "pause") && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {DEMO_SOURCES.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#4D4C7D] bg-white border border-[#363062]/10 px-2.5 py-1 rounded-lg"
                          >
                            <FileText size={11} className="text-[#363062]" /> {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-white border border-[#E6E1EE] rounded-2xl shadow-md p-4 items-center justify-center transition-transform duration-300 hover:-translate-y-1 hover:scale-110">
                <ShieldCheck className="text-[#363062]" />
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 sm:mt-20 bg-white border border-[#E6E1EE] rounded-3xl shadow-sm px-6 sm:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <div key={s.label} className={`group cursor-default transition-transform duration-300 hover:-translate-y-1 ${i !== 0 ? "md:border-l md:border-[#E6E1EE]" : ""}`}>
                <p className="text-2xl sm:text-3xl font-bold text-[#363062]" style={{ fontFamily: FONT_DISPLAY }}>
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: FONT_MONO }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#827397] mb-3" style={{ fontFamily: FONT_MONO }}>
            Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#363062]" style={{ fontFamily: FONT_DISPLAY }}>
            Everything You Need
          </h2>
          <p className="mt-3 text-[#4B5563]">
            A single platform to manage documents, collaborate with AI, and securely share enterprise knowledge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const style = ACCENT_STYLES[f.accent];
            return (
              <div key={f.title} className="group bg-white border border-[#E6E1EE] hover:border-[#D5CFE3] rounded-3xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:rotate-6 ${style.icon}`}>
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-[#363062]" style={{ fontFamily: FONT_DISPLAY }}>{f.title}</h3>
                <p className="mt-3 text-[#4B5563] leading-7">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-[#F8F7FB] border-y border-[#E6E1EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#827397] mb-3" style={{ fontFamily: FONT_MONO }}>
              Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#363062]" style={{ fontFamily: FONT_DISPLAY }}>
              From Documents to Answers in 3 Steps
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="hidden md:block absolute top-[3.25rem] left-[16.5%] right-[16.5%] border-t border-dashed border-[#D5CFE3]" />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="group relative">
                  <div className="bg-white border border-[#E6E1EE] group-hover:border-[#D5CFE3] rounded-3xl p-7 h-full shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-[#363062] text-white flex items-center justify-center font-bold border border-[#363062] transition-transform duration-300 group-hover:scale-110" style={{ fontFamily: FONT_MONO }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-[#F5F3F9] border border-[#E6E1EE] group-hover:border-[#363062] group-hover:bg-[#363062] flex items-center justify-center transition-all duration-300">
                        <Icon size={22} className="text-[#363062] transition-colors duration-300 group-hover:text-white" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-[#363062]" style={{ fontFamily: FONT_DISPLAY }}>{s.title}</h3>
                    <p className="mt-2 text-[#4B5563] leading-7">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#363062] to-[#4D4C7D] border border-[#2F2B55] rounded-[32px] p-8 sm:p-10 lg:p-16 text-center shadow-xl">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#DFCFEE]/20 blur-3xl" />

          <h2 className="text-3xl sm:text-4xl font-bold text-white relative" style={{ fontFamily: FONT_DISPLAY }}>
            Ready to Transform Your Enterprise Knowledge?
          </h2>
          <p className="mt-5 text-[#DFCFEE] max-w-2xl mx-auto leading-7 relative">
            Organize documents, empower employees with AI, and build a smarter workplace using KnowFlow AI.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5 relative">
            <Link to="/signup" className="bg-white text-[#363062] font-semibold px-8 py-4 rounded-2xl border border-white hover:scale-105 hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
              Get Started
            </Link>
            <Link to="/login" className="border border-white/40 hover:border-white text-white px-8 py-4 rounded-2xl hover:bg-white/10 hover:scale-105 transition-all duration-300">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#E6E1EE] bg-[#FCFBFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="group flex items-center gap-3 w-fit">
              <img src="/image.png" alt="KnowFlow AI" className="h-9 transition-transform duration-300 group-hover:scale-105" />
              <span className="font-semibold text-[#363062]">KnowFlow AI</span>
            </div>
            <p className="mt-4 text-sm text-[#6B7280] leading-6">
              AI powered enterprise knowledge platform for documents, SOPs and policies.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#363062] uppercase tracking-wide">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <li><a href="#features" className="hover:text-[#363062] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#363062] transition-colors">How it works</a></li>
              <li><Link to="/signup" className="hover:text-[#363062] transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#363062] uppercase tracking-wide">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <li><a href="#about" className="hover:text-[#363062] transition-colors">About</a></li>
              <li><Link to="/login" className="hover:text-[#363062] transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#363062] uppercase tracking-wide">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <li><a href="#" className="hover:text-[#363062] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#363062] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E6E1EE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <p className="text-sm text-[#6B7280] text-center">
              © 2026 KnowFlow AI • AI Powered Enterprise Knowledge Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;