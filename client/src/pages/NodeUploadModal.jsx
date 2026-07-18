import React, { useState } from "react";
import { Upload, Link2, Loader2, X, FileCheck } from "lucide-react";
import api from "../api/axios";

export default function NodeUploadModal({ isOpen, onClose, refreshNodes }) {
  const [file, setFile] = useState(null);
  const [nodeData, setNodeData] = useState({
    nodeId: "",
    type: "Equipment",
    label: "",
    status: "Optimal",
    system: "",
    load: "",
    rev: "",
    author: "",
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  if (!isOpen) return null;

  const handleUploadAndCreate = async (e) => {
  e.preventDefault();
  if (!nodeData.nodeId.trim() || !nodeData.label.trim()) {
    setMessage({ text: "Node ID and Label are required.", type: "error" });
    return;
  }

  try {
    setUploading(true);

    // 1. Function to convert the real file into a readable Base64 string
    const getBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    let fileDataUri = "";
    if (file) {
      fileDataUri = await getBase64(file); // This captures the real file data!
    }

    // 2. Build the document payload with the real data string attached
    const mockLinkedDocument = {
      _id: `mock-doc-${Date.now()}`,
      fileName: file ? file.name : "system-schematic-guide.pdf",
      title: file ? `${nodeData.nodeId} Operational Manual` : "Standard Blueprint Spec Guide",
      category: nodeData.type === "Equipment Asset" ? "Manuals" : "Procedures",
      fileData: fileDataUri, // <-- The actual file content is stored here
      fileType: file ? file.type : "text/plain"
    };

    const newNode = {
      _id: `mock-node-${Date.now()}`,
      nodeId: nodeData.nodeId,
      type: nodeData.type,
      label: nodeData.label,
      status: nodeData.status,
      system: nodeData.system || "General Loop",
      load: nodeData.load || "0%",
      rev: nodeData.rev || "v1.0",
      author: nodeData.author || "System Generated",
      linkedDocument: mockLinkedDocument
    };

    const existingNodes = JSON.parse(localStorage.getItem("mock_nodes") || "[]");
    existingNodes.push(newNode);
    localStorage.setItem("mock_nodes", JSON.stringify(existingNodes));

    setMessage({ text: "Success! Real document mapped locally.", type: "success" });
    if (refreshNodes) refreshNodes();
    setTimeout(() => { onClose(); }, 1200);
  } catch (err) {
    setMessage({ text: "Failed to read actual file data.", type: "error" });
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Close Button Anchor */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
          type="button"
        >
          <X size={20} />
        </button>
        
        {/* Header Section */}
        <div className="pr-8">
          <h2 className="text-xl md:text-2xl font-black text-[#363062] flex items-center gap-2 tracking-tight">
            <Link2 size={24} className="text-[#4D4C7D]" /> Provision System Node
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">
            Link dynamic plant assets, monitoring telemetry loops, and contextual system manuals into the active layout canvas.
          </p>
        </div>

        <hr className="border-slate-100" />

        <form onSubmit={handleUploadAndCreate} className="space-y-4 text-xs font-semibold text-[#4D4C7D]">
          
          {/* Identifiers Group */}
          <div>
            <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
              Node Identifier
            </label>
            <input 
              type="text" required placeholder="e.g. PUMP-101"
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-bold rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition"
              value={nodeData.nodeId}
              onChange={e => setNodeData({...nodeData, nodeId: e.target.value})}
            />
          </div>

          {/* Classification Options Split Row Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
                Classification Category
              </label>
              <select 
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-black rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition cursor-pointer"
                value={nodeData.type}
                onChange={e => setNodeData({...nodeData, type: e.target.value})}
              >
                <option value="Equipment">Equipment Asset</option>
                <option value="SOP Document">SOP Document Reference</option>
                <option value="System Block">System Block Module</option>
              </select>
            </div>
            
            {nodeData.type === "Equipment" && (
              <div>
                <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
                  Telemetry Health Status
                </label>
                <select 
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-black rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition cursor-pointer"
                  value={nodeData.status}
                  onChange={e => setNodeData({...nodeData, status: e.target.value})}
                >
                  <option value="Optimal">Optimal</option>
                  <option value="Maintenance Required">Maintenance Required</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            )}
          </div>

          {/* Description Text Layout */}
          <div>
            <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
              Description Label
            </label>
            <input 
              type="text" required placeholder="Describe this system component context..."
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-bold rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition"
              value={nodeData.label}
              onChange={e => setNodeData({...nodeData, label: e.target.value})}
            />
          </div>

          {/* Dynamic Configuration Conditions Block Wrapper */}
          {nodeData.type === "Equipment" && (
            <div>
              <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
                System Loop Grouping
              </label>
              <input 
                type="text" placeholder="e.g. Primary Cooling Loop"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-bold rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition"
                value={nodeData.system}
                onChange={e => setNodeData({...nodeData, system: e.target.value})}
              />
            </div>
          )}

          {nodeData.type === "System Block" && (
            <div>
              <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
                Current Operational Capacity Load
              </label>
              <input 
                type="text" placeholder="e.g. 84%"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-bold rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition"
                value={nodeData.load}
                onChange={e => setNodeData({...nodeData, load: e.target.value})}
              />
            </div>
          )}

          {nodeData.type === "SOP Document" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
                  Revision Code
                </label>
                <input 
                  type="text" placeholder="e.g. rev-4.1"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-bold rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition"
                  value={nodeData.rev}
                  onChange={e => setNodeData({...nodeData, rev: e.target.value})}
                />
              </div>
              <div>
                <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
                  Author Name
                </label>
                <input 
                  type="text" placeholder="e.g. Operations Team"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 text-[#363062] font-bold rounded-xl focus:bg-white focus:border-[#363062] focus:outline-none transition"
                  value={nodeData.author}
                  onChange={e => setNodeData({...nodeData, author: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Enhanced File Drag & Drop Target Layout */}
          <div>
            <label className="block tracking-wide uppercase font-extrabold text-[10px] text-[#363062]/80 mb-1.5">
              Attach Reference Document
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative ${
              file ? "border-emerald-400 bg-emerald-50/20" : "border-slate-200 hover:bg-slate-50"
            }`}>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={e => setFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex flex-col items-center justify-center animate-fadeIn">
                  <FileCheck size={28} className="text-emerald-500 mb-1.5" />
                  <p className="text-[#363062] font-bold text-xs break-all px-4 max-w-full truncate">{file.name}</p>
                  <p className="text-emerald-600/70 text-[10px] mt-0.5">Ready to transmit</p>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload size={24} className="mx-auto mb-1.5 opacity-80" />
                  <p className="font-semibold text-slate-500">Drop asset blueprint manual here</p>
                  <p className="text-[10px] opacity-75 mt-0.5">Supports PDF, DOCX or Images up to 25MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Response Notification Message Containers */}
          {message.text && (
            <div className={`p-3.5 rounded-xl text-center font-bold text-xs border ${
              message.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}>
              {message.text}
            </div>
          )}

          {/* Action Trigger Button Anchor */}
          <button
            type="submit" disabled={uploading}
            className="w-full bg-[#363062] text-white py-3.5 px-4 rounded-xl font-extrabold flex items-center justify-center gap-2 hover:bg-[#4D4C7D] active:scale-[0.99] disabled:opacity-40 text-sm tracking-wide shadow-md hover:shadow-lg transition-all"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing Node Upload...
              </>
            ) : (
              "Bind Asset Map Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}