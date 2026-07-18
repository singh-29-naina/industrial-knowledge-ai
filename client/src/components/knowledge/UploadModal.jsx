import { X, UploadCloud, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import api from "../../api/axios";

const UploadModal = ({ open, setOpen, onUploadSuccess }) => {
  const [files, setFiles] = useState([]); // [{ file, status: 'pending'|'uploading'|'done'|'error', error? }]
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setFiles([]); setCategory(""); setDepartment(""); setDescription("");
    setOpen(false);
  };

  const addFiles = (fileList) => {
    const newEntries = Array.from(fileList).map((file) => ({ file, status: "pending" }));
    setFiles((prev) => [...prev, ...newEntries]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);

    // Sequential, not parallel — avoids hammering the Python ingestion service
    // with concurrent large-file parses, and lets each row show real progress.
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;

      setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f)));

      const formData = new FormData();
      formData.append("file", files[i].file);
      if (category) formData.append("category", category);
      if (department) formData.append("department", department);
      if (description) formData.append("description", description);

      try {
        await api.post("/api/documents/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "done" } : f)));
      } catch (err) {
        console.error(`Upload failed for ${files[i].file.name}:`, err);
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, status: "error", error: err.response?.data?.message || "Upload failed" } : f)));
      }
    }

    setUploading(false);
    onUploadSuccess?.();
  };

  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div className="fixed inset-0 bg-[#363062]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[650px] max-w-full shadow-xl border border-[#363062]/10 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b border-[#363062]/5 p-6 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#363062]">Ingest Document Artifacts</h2>
            <p className="text-xs font-medium text-[#4D4C7D] mt-1">Upload one or more files for direct neural knowledge mapping.</p>
          </div>
          <button onClick={resetAndClose} className="p-2 rounded-xl text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/40 transition-colors duration-200"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <label className="group border-2 border-dashed border-[#363062]/20 hover:border-[#363062]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/30 hover:bg-[#DFCFEE]/20 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-[#DFCFEE]/50 text-[#363062] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#DFCFEE]"><UploadCloud size={22} /></div>
            <h3 className="text-sm font-bold tracking-tight text-[#363062] mt-4">Drag & Drop Industrial Files</h3>
            <p className="text-xs text-[#4D4C7D] font-medium mt-1">Select multiple files at once — PDFs, spreadsheets, up to 64MB each</p>
            <input type="file" multiple className="hidden" onChange={(e) => e.target.files?.length && addFiles(e.target.files)} />
          </label>

          {files.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-[#363062]/10 rounded-xl px-3 py-2.5">
                  <FileText size={16} className="text-[#363062]/60 shrink-0" />
                  <span className="text-xs font-medium text-[#363062] truncate flex-1">{f.file.name}</span>
                  {f.status === "pending" && (
                    <button onClick={() => removeFile(idx)} className="text-[#4D4C7D]/60 hover:text-rose-500"><X size={14} /></button>
                  )}
                  {f.status === "uploading" && <Loader2 size={14} className="animate-spin text-[#363062]" />}
                  {f.status === "done" && <CheckCircle2 size={14} className="text-emerald-500" />}
                  {f.status === "error" && <XCircle size={14} className="text-rose-500" title={f.error} />}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-tight text-[#363062]">System Category Tag</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full bg-white border border-[#363062]/10 rounded-xl px-3 py-2.5 text-xs font-medium text-[#363062] outline-none focus:border-[#363062]/40 transition-colors">
                <option value="">Select Category</option>
                <option value="Manuals">Manuals</option>
                <option value="SOPs">SOPs</option>
                <option value="Inspection Reports">Inspection Reports</option>
                <option value="Maintenance Records">Maintenance Records</option>
                <option value="Safety & Regulations">Safety & Regulations</option>
                <option value="Audit Artifacts">Audit Artifacts</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold tracking-tight text-[#363062]">Target Core Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}
                className="mt-1.5 w-full bg-white border border-[#363062]/10 rounded-xl px-3 py-2.5 text-xs font-medium text-[#363062] outline-none focus:border-[#363062]/40 transition-colors">
                <option value="">Select Department</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Production">Production</option>
                <option value="Quality">Quality</option>
                <option value="Safety">Safety</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-tight text-[#363062]">Operational Meta Description (applies to all files in this batch)</label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive operational footprint description for explicit context indexing..."
              className="mt-1.5 w-full bg-white border border-[#363062]/10 rounded-xl px-3 py-2.5 text-xs font-medium text-[#363062] placeholder-[#4D4C7D]/50 outline-none resize-none focus:border-[#363062]/40 transition-colors" />
          </div>
        </div>

        <div className="border-t border-[#363062]/5 bg-slate-50/50 p-4 flex justify-end gap-3 shrink-0">
          <button onClick={resetAndClose} disabled={uploading} className="px-4 py-2.5 rounded-xl border border-[#363062]/10 text-xs font-bold text-[#363062] bg-white hover:bg-slate-50 hover:border-[#363062]/20 transition-all duration-200 disabled:opacity-50">
            {allDone ? "Close" : "Cancel Execution"}
          </button>
          {!allDone && (
            <button onClick={handleSubmit} disabled={uploading || files.length === 0} className="px-5 py-2.5 rounded-xl bg-[#363062] text-white hover:bg-[#4D4C7D] transition-all duration-200 text-xs font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {uploading ? "Ingesting..." : `Commit Ingestion (${files.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;