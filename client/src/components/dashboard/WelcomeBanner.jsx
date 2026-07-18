import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Bot,
  Search,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const actions = [
  {
    title: "Upload Documents",
    description: "Ingest SOPs, P&IDs, manuals, and data sheets.",
    icon: UploadCloud,
  },
  {
    title: "Ask AI Copilot",
    description: "Query plant intelligence with source attribution.",
    icon: Bot,
  },
  {
    title: "Cross-System Search",
    description: "Locate documents across 7-12 fragmented platforms.",
    icon: Search,
  },
  {
    title: "Knowledge Discovery",
    description: "Review auto-generated graph linkages.",
    icon: FileText,
  },
];

const WelcomeBanner = () => {
  const navigate = useNavigate();

  // 🟢 Instantly grab the saved name from localStorage before the first render
  const [userName] = useState(() => {
    return localStorage.getItem("userName") || "User";
  });

  return (
    <div className="space-y-10 p-1">
      {/* Welcome Banner */}
      <div 
        className="rounded-3xl bg-gradient-to-br from-[#363062] via-[#4D4C7D] to-[#363062] 
                   text-white p-10 overflow-hidden relative shadow-md border border-[#363062]/20"
      >
        {/* Abstract structural glow elements */}
        <div className="absolute -right-10 -top-10 h-80 w-80 rounded-full bg-[#DFCFEE]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/4 -bottom-20 h-60 w-60 rounded-full bg-[#DFCFEE]/5 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/15">
            <Sparkles size={14} className="text-[#DFCFEE]" />
            <span className="uppercase tracking-[2px] text-white/80 text-xs font-semibold">
              Industrial Knowledge Intelligence
            </span>
          </div>

          {/* 🟢 Dynamically displays the user's name */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-6 text-white">
            Welcome Back, {userName} 👋
          </h1>

          <p className="mt-4 text-base md:text-lg text-[#DFCFEE]/90 font-normal leading-relaxed max-w-3xl">
            Bridge the knowledge cliff. Seamlessly process multi-format documentation, extract active 
            equipment tags, and generate instant root cause context directly at the point of need.
          </p>

          {/* 🟢 Routes to your new /system-map page */}
          <button 
            onClick={() => navigate("/system-map")}
            className="mt-8 flex items-center gap-2 bg-white text-[#363062] px-6 py-3.5 rounded-xl 
                       font-bold hover:bg-[#DFCFEE] hover:scale-[1.02] active:scale-[0.98] 
                       transition-all duration-200 shadow-sm group"
          >
            Launch System Mapping
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#363062]">
            System Operations
          </h2>
          <button className="text-[#4D4C7D] text-sm font-semibold hover:text-[#363062] transition-colors hover:underline underline-offset-4">
            View All Utilities
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="group relative bg-white/70 rounded-2xl p-6 border border-[#363062]/10 
                           hover:border-[#363062]/30 hover:bg-white text-left shadow-sm 
                           hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Accent indicator bar syncing with Sidebar */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full bg-[#363062] opacity-0 group-hover:opacity-100 transition-all duration-200" />

                <div>
                  <div className="h-14 w-14 rounded-xl bg-[#DFCFEE]/50 border border-[#363062]/5 flex items-center justify-center text-[#363062] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#DFCFEE]">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold tracking-tight text-[#363062]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[#4D4C7D] text-xs font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#363062] opacity-80 group-hover:opacity-100 transition-opacity">
                  Initialize
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;