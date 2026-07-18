import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Network, Activity, Database, ShieldAlert, FileText, Cpu, LayoutGrid, Bot, Loader2, Plus } from "lucide-react";
import api from "../api/axios";
import NodeUploadModal from "./NodeUploadModal"; // <-- Import our new modal component

const ICON_MAP = { Equipment: Cpu, "SOP Document": FileText, "System Block": LayoutGrid };

const COLOR_MAP = {
  Equipment: "border-emerald-500/20 text-emerald-950 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40",
  "SOP Document": "border-indigo-500/20 text-indigo-950 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40",
  "System Block": "border-[#363062]/20 text-[#363062] bg-[#363062]/5 hover:bg-[#363062]/10 hover:border-[#363062]/40",
};

export default function SystemMap() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal control state logic

  // Extracted logic into a global function scope context to enable modal callbacks
  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/system-map/nodes");
      setNodes(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load system topology:", err);
      setError("Failed to load live topology data.");
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const goToLinkedDocumentChat = () => {
    if (!selectedNode?.linkedDocument) return;
    navigate("/ai-copilot", {
      state: {
        contextDocuments: [{
          fileName: selectedNode.linkedDocument.fileName,
          title: selectedNode.linkedDocument.title || selectedNode.linkedDocument.fileName,
        }],
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#363062]/10 via-[#DFCFEE]/30 to-[#4D4C7D]/15 p-4 md:p-8 font-sans text-[#363062] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-[#DFCFEE]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-[#4D4C7D]/10 blur-[130px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[#363062] bg-white/60 hover:bg-white backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#363062]/10 transition-all duration-200 text-sm font-bold w-fit shadow-sm group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          {/* New Node Creation Trigger Button Hook */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-white bg-[#363062] hover:bg-[#4D4C7D] transition-all duration-200 px-4 py-2.5 rounded-2xl border border-transparent shadow-sm text-sm font-bold w-fit"
          >
            <Plus size={16} /> Add System Element
          </button>
        </div>

        <div className="text-left md:text-right">
          <h1 className="text-2xl md:text-3xl font-black text-[#363062] tracking-tight flex items-center gap-2 md:justify-end">
            <Network className="text-[#4D4C7D]" size={28} /> Interactive System Mapping
          </h1>
          <p className="text-xs text-[#4D4C7D] font-bold mt-1">
            Visualizing topological linkages between physical plant nodes and digital documentation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md border-2 border-[#363062]/10 rounded-3xl p-4 md:p-6 relative overflow-hidden h-[450px] md:h-[550px] shadow-lg flex flex-col">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#363062] px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-white font-bold shadow-md">
            <Activity className="text-emerald-400 animate-pulse" size={14} />
            Live Topology Engine
          </div>

          <div className="h-full flex items-center justify-center relative mt-6">
            <div className="absolute inset-0 bg-[radial-gradient(#363062_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.08]"></div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 text-[#4D4C7D] text-sm font-bold relative z-10">
                <Loader2 size={20} className="animate-spin" /> Loading live topology...
              </div>
            ) : error ? (
              <p className="text-xs font-bold text-rose-500 relative z-10">{error}</p>
            ) : nodes.length === 0 ? (
              <div className="text-center px-6 relative z-10">
                <p className="text-sm font-bold text-[#4D4C7D]">No topology nodes have been configured yet.</p>
                <p className="text-xs text-[#4D4C7D]/70 mt-2">Click "Add System Element" above to provision dynamic hardware nodes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10 w-full max-w-2xl px-2 overflow-y-auto max-h-[380px] md:max-h-full py-2">
                {nodes.map((node) => {
                  const isSelected = selectedNode?._id === node._id;
                  const NodeIcon = ICON_MAP[node.type] || LayoutGrid;
                  const colorClass = COLOR_MAP[node.type] || COLOR_MAP["System Block"];

                  return (
                    <button
                      key={node._id}
                      onClick={() => setSelectedNode(node)}
                      className={`group relative rounded-2xl p-5 text-left border-2 transition-all duration-300 flex flex-col justify-between h-32 ${
                        isSelected
                          ? "bg-gradient-to-br from-[#363062] to-[#4D4C7D] border-[#363062] text-white shadow-xl scale-[1.03] ring-4 ring-[#DFCFEE]/50"
                          : `bg-white/70 border-[#363062]/10 shadow-sm hover:shadow-md hover:-translate-y-1 ${colorClass}`
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-r-full transition-all duration-200 ${
                          isSelected ? "bg-[#DFCFEE] opacity-100" : "bg-[#363062] opacity-0 group-hover:opacity-100"
                        }`}
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold block ${isSelected ? "text-[#DFCFEE]" : "text-[#4D4C7D] opacity-85"}`}>
                            {node.type}
                          </span>
                          <h4 className="font-black text-sm md:text-base truncate mt-1 tracking-tight">{node.nodeId}</h4>
                        </div>
                        <NodeIcon size={18} className={isSelected ? "text-[#DFCFEE]" : "text-[#4D4C7D] opacity-70"} />
                      </div>
                      <p className={`text-xs truncate font-semibold mt-2 ${isSelected ? "text-white/80" : "text-[#4D4C7D]/85"}`}>
                        {node.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md border-2 border-[#363062]/10 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#363062] mb-6 flex items-center gap-2 border-b border-[#363062]/15 pb-3">
              <Database size={20} className="text-[#4D4C7D]" /> Element Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-5">
                <div className="p-5 bg-gradient-to-br from-[#363062]/10 to-[#4D4C7D]/10 rounded-2xl border-2 border-[#363062]/10 shadow-sm">
                  <span className="text-xs font-black text-[#4D4C7D] uppercase tracking-wider block">
                    Active Link: {selectedNode.type}
                  </span>
                  <h2 className="text-2xl font-black text-[#363062] mt-1.5 tracking-tight">{selectedNode.nodeId}</h2>
                  <p className="text-xs font-bold text-[#4D4C7D] mt-2 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-[#363062]/10">{selectedNode.label}</p>
                </div>

                {selectedNode.type === "Equipment" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs p-3.5 bg-white/80 border-2 border-[#363062]/5 rounded-xl shadow-sm">
                      <span className="text-[#4D4C7D] font-bold">System Loop:</span>
                      <span className="font-extrabold text-[#363062]">{selectedNode.system || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-3.5 bg-white/80 border-2 border-[#363062]/5 rounded-xl shadow-sm">
                      <span className="text-[#4D4C7D] font-bold">Linked Document:</span>
                      <span className="font-extrabold text-[#363062]">
                        {selectedNode.linkedDocument?.title || selectedNode.linkedDocument?.fileName || "None linked"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-3.5 bg-white/80 border-2 border-[#363062]/5 rounded-xl shadow-sm">
                      <span className="text-[#4D4C7D] font-bold">Status:</span>
                      <span className={`font-black px-3 py-1 rounded-full text-xs border ${
                        selectedNode.status === "Optimal"
                          ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-800 border-amber-500/20 animate-pulse"
                      }`}>
                        {selectedNode.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                )}

                {selectedNode.type === "SOP Document" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs p-3.5 bg-white/80 border-2 border-[#363062]/5 rounded-xl shadow-sm">
                      <span className="text-[#4D4C7D] font-bold">Doc Version:</span>
                      <span className="font-extrabold text-indigo-800 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/10">{selectedNode.rev || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-3.5 bg-white/80 border-2 border-[#363062]/5 rounded-xl shadow-sm">
                      <span className="text-[#4D4C7D] font-bold">Author:</span>
                      <span className="font-extrabold text-[#363062]">{selectedNode.author || "—"}</span>
                    </div>
                  </div>
                )}

                {selectedNode.type === "System Block" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs p-3.5 bg-white/80 border-2 border-[#363062]/5 rounded-xl shadow-sm">
                      <span className="text-[#4D4C7D] font-bold">Current Capacity Load:</span>
                      <span className="font-black text-rose-800 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10">{selectedNode.load || "—"}</span>
                    </div>
                  </div>
                )}

                {selectedNode.linkedDocument && (
                  <button
                    onClick={goToLinkedDocumentChat}
                    className="w-full flex items-center justify-center gap-2 bg-[#363062] hover:bg-[#4D4C7D] text-white font-bold text-xs px-4 py-3 rounded-xl transition-all duration-200"
                  >
                    <Bot size={14} /> Ask Copilot About This Document
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-20 md:py-28 text-[#4D4C7D] space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-[#363062]/10 border-2 border-[#363062]/10 flex items-center justify-center text-[#363062] mx-auto">
                  <ShieldAlert size={28} className="text-[#363062]/80" />
                </div>
                <p className="text-xs font-black max-w-[220px] mx-auto leading-relaxed">
                  Select any platform element on the map to query structural database linkages.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#363062]/15 text-[10px] text-[#4D4C7D] font-black flex justify-between mt-6">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-ping" /> DB Sync: Active</span>
            <span>Refreshed: Real-time</span>
          </div>
        </div>
      </div>

      {/* Renders the modal view container inline */}
      <NodeUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshNodes={fetchNodes}
      />
    </div>
  );
}

export { SystemMap };