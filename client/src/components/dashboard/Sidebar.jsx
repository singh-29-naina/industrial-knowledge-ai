import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Wrench,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const menu = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Knowledge Hub", icon: BookOpen, path: "/knowledge" },
  { title: "AI Copilot", icon: Bot, path: "/ai-copilot" },
  { title: "Maintenance", icon: Wrench, path: "/maintenance" },
  { title: "User Management", icon: Users, path: "/users" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen sticky top-0 transition-all duration-300 ease-in-out
      bg-[#DFCFEE] text-[#363062] border-r border-[#363062]/10 flex flex-col z-20
      ${collapsed ? "w-24" : "w-72"}`}
    >
      {/* Header / Logo Segment */}
      <div className="h-20 shrink-0 border-b border-[#363062]/10 flex items-center justify-between px-4">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100 ml-2"}`}>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#363062] to-[#4D4C7D] flex items-center justify-center shadow-sm">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="whitespace-nowrap">
            <h1 className="text-xl font-bold leading-tight text-[#363062]">IKI</h1>
            <p className="text-xs text-[#4D4C7D]">Industrial AI</p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 w-10 shrink-0 rounded-xl bg-white/70 border border-[#363062]/10 hover:bg-white hover:border-[#363062]/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-[#363062]"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Primary Navigation System */}
      <nav className="mt-6 flex flex-col gap-2 px-3 flex-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-4 rounded-xl px-4 py-3.5 border transition-all duration-200
                 ${
                   isActive
                     ? "bg-white border-[#363062]/10 shadow-sm text-[#363062]"
                     : "border-transparent text-[#4D4C7D] hover:bg-white/60 hover:border-[#363062]/10 hover:translate-x-1 hover:text-[#363062]"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#363062] transition-all duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon
                    size={22}
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-[#363062]" : "text-[#4D4C7D] group-hover:text-[#363062]"
                    }`}
                  />
                  {!collapsed && (
                    <span className={`font-medium whitespace-nowrap ${isActive ? "font-semibold" : ""}`}>
                      {item.title}
                    </span>
                  )}

                  {/* Tooltip visible only when collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-[#363062] px-3 py-2 text-sm font-medium text-white opacity-0 scale-95 origin-left transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 shadow-lg z-50">
                      {item.title}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status Panel */}
      <div className="shrink-0 p-4">
        <div className="group rounded-2xl bg-white/70 border border-[#363062]/10 hover:border-[#363062]/20 hover:bg-white p-4 transition-all duration-300 cursor-default">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#4D4C7D]" />
                <h3 className="font-semibold text-[#363062]">Enterprise Edition</h3>
              </div>
              <p className="text-xs mt-2 text-[#4D4C7D] leading-5">
                AI Powered Industrial Knowledge Platform
              </p>
            </>
          ) : (
            <div className="flex justify-center">
              <Sparkles size={20} className="text-[#4D4C7D] transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;