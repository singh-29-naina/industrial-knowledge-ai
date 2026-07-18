import { FolderOpen, BookOpen, ClipboardList, Wrench, ShieldCheck, FileSearch, BarChart3 } from "lucide-react";

const categories = [
  { name: "All Documents", icon: FolderOpen },
  { name: "Manuals", icon: BookOpen },
  { name: "SOPs", icon: ClipboardList },
  { name: "Maintenance Records", icon: Wrench },
  { name: "Safety & Regulations", icon: ShieldCheck },
  { name: "Inspection Reports", icon: FileSearch },
  { name: "Audit Artifacts", icon: BarChart3 },
];

const CategoryFilter = ({ active, onSelect }) => (
  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-[#363062]/10 shadow-sm">
    <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = active === category.name;
        return (
          <button
            key={category.name}
            onClick={() => onSelect(category.name)}
            className={`group relative flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap border transition-all duration-200 hover:-translate-y-0.5 ${isActive ? "bg-[#363062] border-[#363062] text-white shadow-sm font-semibold" : "bg-[#DFCFEE]/30 border-[#363062]/5 text-[#4D4C7D] hover:bg-[#DFCFEE]/60 hover:border-[#363062]/20 hover:text-[#363062]"}`}
          >
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-6 rounded-t-full bg-[#DFCFEE]" />}
            <Icon size={18} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-[#4D4C7D] group-hover:text-[#363062]"}`} />
            <span className="text-sm font-medium tracking-tight">{category.name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default CategoryFilter;