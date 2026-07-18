import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FileText, Network, Bot, AlertTriangle, Clock, TrendingUp } from "lucide-react";

const DashboardCards = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/dashboard/metrics");
        setMetrics(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err);
        setError("Failed to sync live metrics.");
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/40 border border-[#363062]/10 p-6 h-[164px]" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Ingested Documents", value: metrics?.ingestedDocs?.toLocaleString(), description: "Documents currently indexed", icon: FileText, path: "/knowledge" },
    { title: "Copilot Interactions", value: metrics?.copilotQueries?.toLocaleString(), description: "Questions asked across all sessions", icon: Bot, path: "/ai-copilot" },
    { title: "Knowledge Graph Nodes", value: metrics?.knowledgeNodes, description: "Requires a knowledge graph feature", icon: Network, path: null },
    { title: "Downtime Risks Flagged", value: metrics?.downtimeRisks, description: "Requires a maintenance-risk tracker", icon: AlertTriangle, path: null },
    { title: "Compliance Gap Reviews", value: metrics?.complianceGaps, description: "Requires a compliance tracking feature", icon: Clock, path: null },
    { title: "Avg Time-to-Answer Saved", value: metrics?.timeToAnswerSaved != null ? `${metrics.timeToAnswerSaved}%` : null, description: "No baseline configured yet", icon: TrendingUp, path: null },
  ];

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-fit mb-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-1">
        {cards.map((card) => {
          const Icon = card.icon;
          const clickable = Boolean(card.path);
          const hasValue = card.value !== null && card.value !== undefined;
          return (
            <div
              key={card.title}
              onClick={() => clickable && navigate(card.path)}
              className={`group relative overflow-hidden rounded-2xl bg-white/75 backdrop-blur-sm border border-[#363062]/10 hover:border-[#363062]/35 hover:bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-[164px] ${clickable ? "cursor-pointer" : "cursor-default opacity-80"}`}
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-r-full bg-[#363062] opacity-0 group-hover:opacity-100 transition-all duration-200" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[#4D4C7D] tracking-tight">{card.title}</span>
                  <div className="h-10 w-10 rounded-xl bg-[#DFCFEE]/50 border border-[#363062]/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#DFCFEE] text-[#363062]">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black tracking-tight text-[#363062]">{hasValue ? card.value : "—"}</h3>
                  {!hasValue && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Coming Soon</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#4D4C7D] font-medium mt-3 border-t border-[#363062]/5 pt-3">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCards;