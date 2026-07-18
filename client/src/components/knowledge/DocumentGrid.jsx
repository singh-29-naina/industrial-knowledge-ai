import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import DocumentCard from "./DocumentCard";

const DocumentGrid = ({ documents = [], loading, onDeleteRefresh }) => {
  const [selected, setSelected] = useState([]); // array of document objects
  const navigate = useNavigate();

  const toggleSelect = (doc) => {
    setSelected((prev) =>
      prev.some((d) => d._id === doc._id) ? prev.filter((d) => d._id !== doc._id) : [...prev, doc]
    );
  };

  const askAboutSelected = () => {
    navigate("/ai-copilot", {
      state: {
        contextDocuments: selected.map((d) => ({ fileName: d.fileName, title: d.title || d.name || d.fileName })),
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-10 h-10 border-4 border-[#363062] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-[#4D4C7D]">Analyzing inventory database architecture...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-12 bg-white/40 border border-dashed border-[#363062]/20 rounded-2xl">
        <p className="text-sm font-semibold text-[#4D4C7D]">No industrial artifacts matched your active query filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#363062] text-white rounded-2xl px-5 py-3 shadow-md">
          <span className="text-sm font-semibold">{selected.length} document{selected.length > 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected([])} className="text-xs font-semibold text-white/70 hover:text-white">Clear</button>
            <button onClick={askAboutSelected} className="flex items-center gap-2 bg-white text-[#363062] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#DFCFEE] transition-colors">
              <Bot size={14} /> Ask Copilot
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1 w-full">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id || doc.id}
            document={doc}
            onDeleteSuccess={onDeleteRefresh}
            selected={selected.some((d) => d._id === doc._id)}
            onToggleSelect={() => toggleSelect(doc)}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentGrid;