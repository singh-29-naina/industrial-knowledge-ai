import React from "react";
import { Search, Upload, Filter } from "lucide-react";

const KnowledgeHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onUploadClick, 
  onToggleFilters 
}) => {
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6 p-2 w-full max-w-7xl mx-auto">
      {/* Title & Primary Upload Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#363062]">
            Knowledge Hub
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4D4C7D] max-w-xl leading-relaxed">
            Ingest, classify, and isolate industrial artifacts across corporate operations.
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="flex items-center justify-center gap-2 bg-[#363062] hover:bg-[#4D4C7D]
                     text-white px-5 py-3.5 rounded-xl transition-all duration-200 
                     font-bold text-sm hover:scale-[1.01] active:scale-[0.99] shadow-sm 
                     w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      {/* Query Bar & Advanced Filters Trigger */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#363062]/10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          
          {/* Main Integrated Field Search */}
          <div className="flex-1 flex items-center bg-[#DFCFEE]/30 border border-[#363062]/5 focus-within:border-[#363062]/30 rounded-xl px-3 sm:px-4 transition-colors duration-200 min-w-0">
            <Search
              className="text-[#4D4C7D] shrink-0"
              size={18}
          />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tags, equipment models, safety procedures..."
              className="w-full min-w-0 bg-transparent outline-none px-2 sm:px-3 py-2.5 sm:py-3 text-sm text-[#363062] placeholder-[#4D4C7D]/60 font-medium truncate"
            />
          </div>

          {/* Configuration Parameters Button */}
          <button
            onClick={onToggleFilters}
            className="flex items-center justify-center gap-2 border border-[#363062]/10 
                       rounded-xl px-5 py-2.5 sm:py-3 bg-white hover:bg-[#DFCFEE]/20 hover:border-[#363062]/20
                       text-sm font-bold text-[#363062] transition-all duration-200 cursor-pointer 
                       hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto shrink-0"
          >
            <Filter size={16} className="text-[#4D4C7D]" />
            Parameters
          </button>

        </div>
      </div>
    </div>
  );
};

export default KnowledgeHeader;