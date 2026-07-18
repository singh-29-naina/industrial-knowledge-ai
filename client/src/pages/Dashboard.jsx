import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import DashboardCards from "../components/dashboard/DashboardCards";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import ActivitySection from "../components/dashboard/ActivitySection";

const Dashboard = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased selection:bg-[#DFCFEE] selection:text-[#363062]">
      {/* Sidebar - Persists structural look on left edge */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Viewport Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Greeting Block */}
            <WelcomeBanner />

            {/* Ingested Operational & Graph Performance Stats */}
            <DashboardCards />

            {/* Graph Node Links, Audits & Model Tracking Output */}
            <ActivitySection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;