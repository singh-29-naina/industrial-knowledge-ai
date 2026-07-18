import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Cpu,
  AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Read user authentication profile metrics from localStorage
  const userRole = localStorage.getItem("userRole") || "User";
  const userName = localStorage.getItem("userName") || "User";
  const isAdmin = userRole.toLowerCase() === "admin";

  // 🟢 Live UI Metrics calculated purely from your local frontend data array
  const [gridStatus, setGridStatus] = useState("ONLINE");
  const [averageLoad, setAverageLoad] = useState("0%");
  const [warningCount, setWarningCount] = useState(0);

  useEffect(() => {
    // 🟢 Function to read current node data map configurations from browser storage
    const calculateLiveMetrics = () => {
      const localData = localStorage.getItem("mock_nodes");
      if (!localData) return;

      try {
        const nodes = JSON.parse(localData);
        
        // 1. Calculate how many elements currently have warnings/offline states
        const issues = nodes.filter(
          node => node.status === "Maintenance Required" || node.status === "Offline"
        ).length;
        setWarningCount(issues);

        // 2. Set structural network grid status based on system health
        const totalOffline = nodes.filter(node => node.status === "Offline").length;
        if (totalOffline > 2) {
          setGridStatus("DEGRADED");
        } else {
          setGridStatus("ONLINE");
        }

        // 3. Extract and average out capacity load values (e.g., "84%")
        const loadNodes = nodes.filter(node => node.load && node.load.includes("%"));
        if (loadNodes.length > 0) {
          const totalLoad = loadNodes.reduce((sum, node) => {
            const num = parseInt(node.load.replace(/[^0-9]/g, ""), 10) || 0;
            return sum + num;
          }, 0);
          setAverageLoad(`${Math.round(totalLoad / loadNodes.length)}%`);
        } else {
          setAverageLoad("74%"); // Smart standard base layout default
        }

      } catch (err) {
        console.error("Local storage tracker pipeline parse error", err);
      }
    };

    // Calculate immediately when navbar mounts
    calculateLiveMetrics();

    // 🟢 Check for data updates every 2 seconds so the top bar matches actions instantly
    const metricsSyncInterval = setInterval(calculateLiveMetrics, 2000);
    return () => clearInterval(metricsSyncInterval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogOutAction = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#DFCFEE] via-[#EADBFA] to-[#DFCFEE] border-b border-[#363062]/10 shadow-md">
      <div className="h-16 px-4 lg:px-8 flex items-center gap-5">
        
        <button
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 rounded-xl bg-white/70 border border-[#363062]/10 hover:bg-white flex items-center justify-center transition-all shadow-sm"
        >
          <Menu size={22} className="text-[#363062]" />
        </button>

        <Link to="/dashboard" className="group flex items-center rounded-2xl px-2 py-2 shrink-0 transition-transform duration-200 hover:scale-[1.02]">
          <img src="/image.png" alt="KnowFlow AI" className="h-10 lg:h-11 w-40 object-contain" />
        </Link>

        {/* 🟢 Real-Time Telemetry Ticker powered entirely by local frontend memory */}
        <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-auto">
          <div className="flex items-center gap-6 bg-white/60 backdrop-blur-md px-5 py-2 rounded-2xl border border-[#363062]/10 shadow-inner w-full justify-around text-xs font-bold text-[#363062]">
            
            {/* Grid Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  gridStatus === "ONLINE" ? "bg-emerald-400" : "bg-rose-400"
                }`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${
                  gridStatus === "ONLINE" ? "bg-emerald-500" : "bg-rose-500"
                }`} />
              </span>
              <span className="tracking-wide uppercase text-[10px] text-[#4D4C7D]">Grid Pulse:</span>
              <span className={gridStatus === "ONLINE" ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}>
                {gridStatus}
              </span>
            </div>

            <div className="h-4 w-px bg-[#363062]/15"></div>

            {/* Calculated Average Node Load */}
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#4D4C7D]" />
              <span className="tracking-wide uppercase text-[10px] text-[#4D4C7D]">System Strain:</span>
              <span className="font-mono text-indigo-700">{averageLoad}</span>
            </div>

            <div className="h-4 w-px bg-[#363062]/15"></div>

            {/* Error Counter Tracker */}
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className={warningCount > 0 ? "text-amber-500 animate-pulse" : "text-slate-400"} />
              <span className="tracking-wide uppercase text-[10px] text-[#4D4C7D]">Active Flags:</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-black ${
                warningCount > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
              }`}>
                {warningCount}
              </span>
            </div>

          </div>
        </div>

        {/* Right Menu Controls Container */}
        <div className="flex items-center gap-3 ml-auto">
          {isAdmin && (
            <Link 
              to="/users" 
              className="hidden lg:flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-500 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-amber-600 shadow-md transition-all duration-200"
            >
              <ShieldAlert size={15} />
              Admin Panel
            </Link>
          )}

          <button className="relative h-10 w-10 rounded-xl bg-white/70 border border-[#363062]/10 flex items-center justify-center hover:bg-white transition-all shadow-sm">
            <Bell size={18} className="text-[#4D4C7D]" />
            {warningCount > 0 && (
              <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
            )}
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 h-11 px-3 rounded-xl bg-white/70 border border-[#363062]/10 hover:bg-white/95 transition-all shadow-sm"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#363062] to-[#4D4C7D] text-white flex items-center justify-center font-black text-xs">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden sm:block text-sm font-black text-[#363062]">
                {userName}
              </span>
            </button>

            <div
              className={`absolute right-0 mt-2 w-56 bg-white border border-[#363062]/10 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 z-50 ${
                profileOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
              }`}
            >
              <div className="px-4 py-3 bg-[#F5F3F9] border-b border-[#363062]/10">
                <p className="text-sm font-extrabold text-[#363062] truncate">{userName}</p>
                <p className="text-xs text-[#6B7280] font-bold truncate tracking-wide uppercase mt-0.5 text-[9px]">Role: {userRole}</p>
              </div>

              <button 
                onClick={handleLogOutAction}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={17} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;