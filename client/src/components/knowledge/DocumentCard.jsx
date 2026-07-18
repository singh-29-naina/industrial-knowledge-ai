import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FileText, Eye, Download, Trash2, Bot, Calendar, User, Folder, CheckCircle } from "lucide-react";

const DocumentCard = ({ document, onDeleteSuccess, selected, onToggleSelect }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to completely remove "${document.title || document.name}"?`)) return;
    try {
      const docId = document._id || document.id;
      
      // Frontend-Safe Delete Wrapper
      if (typeof docId === 'string' && docId.startsWith('mock-')) {
        const localData = localStorage.getItem("mock_nodes");
        if (localData) {
          const nodes = JSON.parse(localData);
          const filtered = nodes.filter(n => n.linkedDocument?._id !== docId);
          localStorage.setItem("mock_nodes", JSON.stringify(filtered));
        }
      } else {
        await api.delete(`/api/documents/${docId}`);
      }

      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      console.error("Failed to delete document artifact:", error);
      alert(error.response?.data?.message || "Internal network failure deleting resource.");
    }
  };

  const handleConsultCopilot = () => {
    navigate("/ai-copilot", {
      state: {
        contextDocuments: [{ fileName: document.fileName, title: document.title || document.name || document.fileName }],
      },
    });
  };

  // 🟢 NEW: Handles Viewing the document without a live backend file host
  // 🟢 WORKING VIEW: Opens a new tab rendering the actual file contents
const handleViewDocument = () => {
  if (!document.fileData) {
    alert("No actual file content found for this mock document.");
    return;
  }
  
  // If it's a PDF or Image, open it directly in a new tab natively
  if (document.fileType && (document.fileType.includes("pdf") || document.fileType.includes("image"))) {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`<iframe src="${document.fileData}" width="100%" height="100%" style="border:none;"></iframe>`);
    }
  } else {
    // If it's a text file, open it in a clean browser view window
    const previewWindow = window.open();
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head><title>${document.title || 'Document Preview'}</title></head>
          <body style="font-family:sans-serif; padding:24px; background:#f8fafc;">
            <div style="background:white; padding:24px; border-radius:12px; box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h2 style="color:#363062; margin-top:0;">${document.title || document.name}</h2>
              <hr style="border:0; border-top:1px solid #e2e8f0; margin-bottom:16px;"/>
              <iframe src="${document.fileData}" style="width:100%; height:500px; border:none;"></iframe>
            </div>
          </body>
        </html>
      `);
    }
  }
};

// 🟢 WORKING DOWNLOAD: Downloads the exact, identical file you uploaded
  const handleDownloadSource = () => {
    if (!document.fileData) {
      alert("No source data found to download.");
      return;
    }

    const virtualLink = window.document.createElement("a");
    virtualLink.href = document.fileData; // Uses the exact source file data URI string
    virtualLink.download = document.fileName || "downloaded-file";
    
    window.document.body.appendChild(virtualLink);
    virtualLink.click();
    window.document.body.removeChild(virtualLink);
  };

  const formattedDate = document.createdAt
    ? new Date(document.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })
    : document.date || "Recent";

  return (
    <div className="group relative bg-white/70 rounded-2xl border border-[#363062]/10 shadow-sm hover:border-[#363062]/30 hover:bg-white hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between h-full min-w-0">
      <button
        onClick={onToggleSelect}
        className={`absolute top-4 left-4 h-5 w-5 rounded-md border-2 flex items-center justify-center z-10 transition-colors ${selected ? "bg-[#363062] border-[#363062]" : "bg-white/80 border-[#363062]/30 hover:border-[#363062]"}`}>
        {selected && <div className="h-2 w-2 rounded-sm bg-white" />}
      </button>
      <span className="absolute left-0 top-1/3 -translate-y-1/2 h-10 w-1 rounded-r-full bg-[#363062] opacity-0 group-hover:opacity-100 transition-all duration-200" />
      <div className="p-6">
        <div className="flex justify-between items-start gap-2">
          <div className="h-10 w-10 rounded-xl bg-[#DFCFEE]/50 border border-[#363062]/5 flex items-center justify-center text-[#363062] shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#DFCFEE]">
            <FileText size={20} />
          </div>
          <span className="flex items-center gap-1.5 bg-[#DFCFEE] text-[#363062] px-2.5 py-1 rounded-full text-xs font-semibold border border-[#363062]/10 whitespace-nowrap">
            <CheckCircle size={12} /> AI Indexed
          </span>
        </div>

        <h2 className="text-base font-bold tracking-tight text-[#363062] mt-5 line-clamp-2 min-h-[3rem]" title={document?.title || document?.name}>
          {document?.title || document?.name || "Untitled Asset Documentation"}
        </h2>

        <div className="mt-4 space-y-2.5 text-xs font-medium text-[#4D4C7D]">
          <div className="flex items-center gap-2 min-w-0">
            <Folder size={14} className="text-[#363062]/70 shrink-0" />
            <span className="truncate">{document?.category || "Manuals"}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <User size={14} className="text-[#363062]/70 shrink-0" />
            <span className="truncate">
              {typeof document?.uploadedBy === 'object' ? document.uploadedBy?.name : document?.uploadedBy || "System Admin"}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Calendar size={14} className="text-[#363062]/70 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Hub Footer Grid */}
      <div className="border-t border-[#363062]/5 bg-white/40 p-3 flex justify-around items-center shrink-0">
        <button onClick={handleViewDocument} className="p-2 rounded-lg text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/40 transition-all duration-200" title="View Document"><Eye size={18} /></button>
        <button onClick={handleDownloadSource} className="p-2 rounded-lg text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/40 transition-all duration-200" title="Download Source"><Download size={18} /></button>
        <button onClick={handleConsultCopilot} className="p-2 rounded-lg text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/40 transition-all duration-200" title="Consult Copilot"><Bot size={18} /></button>
        <button onClick={handleDelete} className="p-2 rounded-lg text-[#4D4C7D] hover:text-rose-600 hover:bg-rose-50 transition-all duration-200" title="Remove Record"><Trash2 size={18} /></button>
      </div>
    </div>
  );
};

export default DocumentCard;