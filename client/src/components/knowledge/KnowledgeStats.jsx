import { Files, Brain, TriangleAlert } from "lucide-react";

const KnowledgeStats = ({ documents = [], loading }) => {
  const total = documents.length;
  const indexed = documents.filter((d) => d.status === "Ingested").length;
  const failed = documents.filter((d) => d.status === "Failed").length;

  const stats = [
    { title: "Total Documents", value: loading ? "…" : total, icon: Files, pct: 100, statusType: "default" },
    { title: "AI Indexed", value: loading ? "…" : indexed, icon: Brain, pct: total ? Math.round((indexed / total) * 100) : 0, statusType: "default" },
    { title: "Failed Files", value: loading ? "…" : failed, icon: TriangleAlert, pct: total ? Math.round((failed / total) * 100) : 0, statusType: "error" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      {stats.map((item) => {
        const Icon = item.icon;
        const theme = item.statusType === "error"
          ? { box: "bg-red-50 text-red-600 border-red-100", bar: "bg-red-500" }
          : { box: "bg-[#DFCFEE]/50 text-[#363062] border-[#363062]/5", bar: "bg-[#363062]" };
        return (
          <div key={item.title} className="group relative overflow-hidden rounded-2xl bg-white/70 border border-[#363062]/10 hover:border-[#363062]/30 hover:bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full bg-[#363062] opacity-0 group-hover:opacity-100 transition-all duration-200" />
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-xs font-semibold text-[#4D4C7D] tracking-tight">{item.title}</p>
                <h2 className="text-2xl font-bold tracking-tight text-[#363062] mt-2">{item.value}</h2>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${theme.box}`}><Icon size={18} /></div>
            </div>
            <div className="mt-5 pt-2">
              <div className="w-full h-1.5 rounded-full bg-slate-100/80 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${theme.bar}`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KnowledgeStats;