import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import KnowledgeHeader from "../components/knowledge/KnowledgeHeader";
import KnowledgeStats from "../components/knowledge/KnowledgeStats";
import CategoryFilter from "../components/knowledge/CategoryFilter";
import DocumentGrid from "../components/knowledge/DocumentGrid";
import UploadModal from "../components/knowledge/UploadModal";

const KnowledgeHub = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Documents");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesCategory = activeCategory === "All Documents" || doc.category === activeCategory;
      const matchesSearch = !term ||
        (doc.title || doc.fileName || "").toLowerCase().includes(term) ||
        (doc.category || "").toLowerCase().includes(term) ||
        (doc.department || "").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [documents, activeCategory, searchTerm]);

  return (
    <div className="flex bg-[#F5FAFA] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            <KnowledgeHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUploadClick={() => setOpenUpload(true)}
              onToggleFilters={() => {}}
            />
            <KnowledgeStats documents={documents} loading={loading} />
            <CategoryFilter active={activeCategory} onSelect={setActiveCategory} />
            <DocumentGrid documents={filteredDocuments} loading={loading} onDeleteRefresh={fetchDocuments} />
          </div>
        </main>
      </div>
      <UploadModal open={openUpload} setOpen={setOpenUpload} onUploadSuccess={fetchDocuments} />
    </div>
  );
};

export default KnowledgeHub;