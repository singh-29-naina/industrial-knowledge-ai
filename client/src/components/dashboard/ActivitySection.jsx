import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  UserCheck,
  ShieldCheck,
  Clock,
  Settings,
  AlertTriangle,
} from "lucide-react";


// Helper map to dynamically assign Lucide icons based on activity type from backend
const ICON_MAP = {
  upload: UploadCloud,
  document: FileText,
  user: UserCheck,
  compliance: ShieldCheck,
  system: Settings,
  alert: AlertTriangle,
};

const ActivitySection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FORCE_MOCK_DATA = false;

  // 🟢 CONFIGURATION: Put your actual backend server URL here
  const BACKEND_URL =import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; 

  const defaultFallbackActivities = [
    {
      type: "upload",
      title: "Pump_P101_Manual.pdf uploaded",
      subtitle: "Rahul Sharma • 5 min ago",
    },
    {
      type: "user",
      title: "Employee registration approved",
      subtitle: "Priya Verma • 18 min ago",
    },
    {
      type: "document",
      title: "Boiler SOP updated",
      subtitle: "Version 2.1 • Today",
    },
    {
      type: "compliance",
      title: "Compliance report generated",
      subtitle: "Monthly OISD Report • Yesterday",
    },
  ];

  useEffect(() => {
    if (FORCE_MOCK_DATA) {
      setActivities(defaultFallbackActivities);
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // 🟢 Combined BACKEND_URL directly into the axios call
        const response = await axios.get(`${BACKEND_URL}/api/documents/activities`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        });

        let rawData = response.data;
        
        if (typeof rawData === "string") {
          try {
            rawData = JSON.parse(rawData);
          } catch (e) {
            console.error("🚨 RAW NON-JSON RESPONSE FROM BACKEND:", response.data.slice(0, 300));
            throw new Error("Failed to parse response body as valid JSON");
          }
        }

        let dataArray = null;
        if (Array.isArray(rawData)) {
          dataArray = rawData;
        } else if (rawData && Array.isArray(rawData.activities)) {
          dataArray = rawData.activities;
        } else if (rawData && Array.isArray(rawData.data)) {
          dataArray = rawData.data;
        }

        if (dataArray) {
          setActivities(dataArray);
          setError(null);
        } else {
          throw new Error("Unexpected JSON structure.");
        }
      } catch (err) {
        console.warn("Activities API failed, utilizing UI fallbacks:", err.message);
        setError("Failed to load live feed. Displaying standard logs.");
        setActivities(defaultFallbackActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Professional pulsing skeletons for loading states
  if (loading) {
    return (
      <section className="bg-white/70 backdrop-blur-md border border-[#363062]/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#363062]/10 flex justify-between items-center">
          <div>
            <div className="h-6 w-40 bg-[#363062]/10 rounded-md"></div>
            <div className="h-3 w-56 bg-[#363062]/5 rounded-md mt-2"></div>
          </div>
          <div className="h-4 w-14 bg-[#363062]/10 rounded-md"></div>
        </div>
        <div className="divide-y divide-[#363062]/10">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-5 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-[#363062]/10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-[#363062]/10 rounded-md"></div>
                <div className="h-3 w-1/4 bg-[#363062]/5 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-[#DFCFEE]/30 border border-[#363062]/10 text-[#363062] text-xs font-semibold rounded-xl flex items-center gap-2 max-w-fit">
          <Clock size={14} /> Offline Mode: Viewing saved historical logs.
        </div>
      )}

      <section className="bg-white/75 backdrop-blur-sm border border-[#363062]/10 rounded-2xl shadow-sm transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#363062]/10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#363062] tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs md:text-sm text-[#4D4C7D] font-medium mt-1">
              Latest updates across your workspace
            </p>
          </div>
          <button className="text-xs md:text-sm font-extrabold text-[#363062] hover:text-[#4D4C7D] transition">
            View All
          </button>
        </div>

        {/* Activities List */}
        <div className="divide-y divide-[#363062]/10">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <Clock size={36} className="text-[#4D4C7D]/40 mb-3" />
              <p className="text-sm font-bold text-[#363062]">No recent activity</p>
              <p className="text-xs text-[#4D4C7D] mt-1">Your stream will update dynamically when changes occur.</p>
            </div>
          ) : (
            activities.map((item, index) => {
              const Icon = ICON_MAP[item.type] || FileText;

              return (
                <div
                  key={index}
                  className="group relative flex items-center gap-4 px-6 py-5 hover:bg-white/90 transition-all duration-200"
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#363062] opacity-0 group-hover:opacity-100 transition-all duration-150" />

                  <div className="h-12 w-12 rounded-xl bg-[#DFCFEE]/30 border border-[#363062]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#DFCFEE]/60">
                    <Icon size={20} className="text-[#363062]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#363062] text-sm md:text-base truncate group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[#4D4C7D] font-semibold mt-1 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivitySection;